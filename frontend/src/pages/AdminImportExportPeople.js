import React, { Component } from "react";
import styled from "@emotion/styled";
import { ArrowRightAlt, ImportExport, CloudUpload } from "@material-ui/icons";
import { Flex, Box } from "@rebass/grid/emotion";

import apolloClient from "../utils/apollo";
import { downloadCsv } from "../utils/csv";
import Button, { buttonStyles } from "../components/Button";
import Card from "../components/Card";
import DefinitionList from "../components/DefinitionList";
import PageLoader from "../components/PageLoader";
import PersonLink from "../components/PersonLink";

import { EXPORT_PEOPLE_QUERY, IMPORT_CSV_MUTATION } from "../queries";

const formatDepartment = department => {
  if (!department) return "";
  if (department.costCenter) return `${department.costCenter}-${department.name}`;
  return department.name;
};

const formatOffice = office => {
  if (!office) return "";
  return office.externalId;
};

const mapChangedAttributes = change => {
  return Object.keys(change)
    .map(key => {
      if (key.indexOf("_") === 0) return null;
      if (key === "user") return null;
      if (!change[key]) return null;
      return [key, change[key]];
    })
    .filter(c => c !== null);
};

class ExportCard extends Component {
  export = () => {
    apolloClient
      .query({
        query: EXPORT_PEOPLE_QUERY
      })
      .then(response => {
        const {
          users: { results }
        } = response.data;
        if (results) {
          downloadCsv(
            [
              [
                "id",
                "name",
                "email",
                "date_started",
                "date_of_birth",
                "title",
                "reports_to",
                "referred_by",
                "department",
                "team",
                "office",
                "employee_type",
                "is_human",
                "is_directory_hidden"
              ],
              ...results.map(u => [
                u.id,
                u.name,
                u.email,
                u.dateStarted,
                u.dateOfBirth,
                u.title,
                u.reportsTo ? u.reportsTo.email : "",
                u.referredBy ? u.referredBy.email : "",
                formatDepartment(u.department),
                u.team ? u.team.name : "",
                formatOffice(u.office),
                u.employeeType ? u.employeeType.id : "",
                u.isHuman,
                u.isDirectoryHidden
              ])
            ],
            `people-${new Date().getTime()}.csv`
          );
        } else {
          throw new Error("Error exporting people");
        }
      })
      .catch(err => {
        throw err;
      });
  };

  render() {
    return (
      <Card withPadding>
        <p>
          Grab a CSV with core personnel details, which you can then edit and re-upload to
          batch update people.
        </p>
        <Button onClick={this.export}>
          <ImportExport /> Export People
        </Button>
      </Card>
    );
  }
}

const Errors = ({ errors }) => (
  <div>
    <h2>Unhandled Error</h2>
    <p>Whoops! It looks like there was an issue handling your upload.</p>
    <ul>
      {errors.map(e => (
        <li key={e}>{e}</li>
      ))}
    </ul>
    <p>
      We've probably contacted the team about this, but feel free to try again or escalate
      internally.
    </p>
  </div>
);

const PreviewHeader = ({ onApply, saving, changes }) => {
  let numChanges = 0;
  changes.forEach(c => (numChanges += mapChangedAttributes(c).length));
  return (
    <Card withPadding>
      <Flex>
        <Box flex="1">
          <h2>Import Preview</h2>{" "}
          <span>
            {numChanges.toLocaleString()} change{numChanges !== 1 ? "s" : ""}
          </span>
        </Box>
        <Box>
          <Button onClick={onApply} disabled={saving}>
            Apply Changes
          </Button>
        </Box>
      </Flex>
    </Card>
  );
};

const ChangeRow = ({ change }) => (
  <Card>
    <div style={{ marginBottom: "1rem" }}>
      <PersonLink user={change.user} />
    </div>
    <DefinitionList>
      {mapChangedAttributes(change).map(([key, value]) => (
        <React.Fragment key={key}>
          <dt>{key}</dt>
          <dd>
            {value.previous} <ArrowRightAlt /> {value.new}
          </dd>
        </React.Fragment>
      ))}
    </DefinitionList>
  </Card>
);

class ImportManager extends Component {
  constructor(...params) {
    super(...params);
    this.state = {
      saving: false,
      errors: [],
      applied: false
    };
  }

  applyChanges = () => {
    this.setState({
      saving: true
    });
    apolloClient
      .mutate({
        mutation: IMPORT_CSV_MUTATION,
        variables: {
          file: this.props.files[0],
          ignoreEmptyCells: this.props.ignoreEmptyCells,
          apply: true
        }
      })
      .then(response => {
        const { importCsv } = response.data;
        if (importCsv.ok) {
          this.setState({
            saving: false,
            changes: importCsv.changes,
            applied: importCsv.applied
          });
        } else {
          this.setState({
            saving: false,
            applied: false,
            changes: [],
            errors: importCsv.errors
          });
        }
      })
      .catch(err => {
        this.setState({
          errors: ["Unknown"],
          saving: false,
          applied: false
        });
        throw err;
      });
  };

  render() {
    const { changes } = this.props;
    if (!changes)
      return <PageLoader loadingText="Please wait while we process your changes..." />;
    if (!changes.length) {
      return (
        <div>
          <p>There were no changes detected.</p>
        </div>
      );
    }
    const { applied, saving, errors } = this.state;

    if (saving) {
      return (
        <div>
          <PreviewHeader saving={saving} onClick={this.applyChanges} changes={changes} />
          <PageLoader loadingText="Please wait while we save your changes..." />
        </div>
      );
    }
    if (applied) {
      return (
        <div>
          <h2>Result</h2>
          {changes.map(change => {
            return <ChangeRow change={change} key={change.user.id} />;
          })}
        </div>
      );
    }
    if (errors.length) {
      return <Errors errors={errors} />;
    }

    return (
      <div>
        <PreviewHeader saving={saving} onApply={this.applyChanges} changes={changes} />
        {changes.map(change => {
          return <ChangeRow change={change} key={change.user.id} />;
        })}
      </div>
    );
  }
}

export default class ImportExportPeople extends Component {
  constructor(props) {
    super(props);
    this.dropboxRef = React.createRef();
    this.state = {
      errors: [],
      importing: false,
      changes: null,
      ignoreEmptyCells: true,
      files: []
    };
  }

  componentDidMount() {
    let dropbox = this.dropboxRef.current;
    if (dropbox) {
      dropbox.addEventListener("dragenter", e => e.preventDefault(), false);
      dropbox.addEventListener("dragover", e => e.preventDefault(), false);
      dropbox.addEventListener(
        "drop",
        e => {
          e.preventDefault();
          const dt = e.dataTransfer;
          const files = dt.files;
          this.importFiles(files);
        },
        false
      );
    }
  }

  importFiles = files => {
    this.setState({
      importing: true,
      changes: null,
      files
    });
    apolloClient
      .mutate({
        mutation: IMPORT_CSV_MUTATION,
        variables: { file: files[0], ignoreEmptyCells: this.state.ignoreEmptyCells }
      })
      .then(response => {
        const { importCsv } = response.data;
        if (importCsv.ok) {
          this.setState({
            changes: importCsv.changes
          });
        } else {
          this.setState({
            importing: false,
            changes: null,
            errors: importCsv.errors
          });
        }
      })
      .catch(err => {
        this.setState({
          errors: ["Unknown"],
          changes: null,
          importing: false
        });
        throw err;
      });
  };

  render() {
    const { changes, errors, files, ignoreEmptyCells, importing } = this.state;
    if (errors.length) {
      return <Errors errors={errors} />;
    }

    return (
      <section ref={this.dropboxRef}>
        {importing ? (
          <ImportManager
            changes={changes}
            files={files}
            ignoreEmptyCells={ignoreEmptyCells}
          />
        ) : (
          <React.Fragment>
            <Card>
              <h1>Import/Export People</h1>
            </Card>
            <ExportCard />
            <Card withPadding>
              <p>
                If you've got a CSV in the expected format, you can import it to batch
                update people. You'll be given a preview of the changes before they're
                applied.
              </p>
              <p>Some things to note:</p>
              <ul>
                <li>
                  <code>date_of_birth</code> will always use the fixed year 1900 for
                  privacy reasons
                </li>
                <li>
                  <code>department</code> is in the format of{" "}
                  <code>[COST_CENTER]-[NAME]</code>
                </li>
                <li>
                  <code>employee_type</code> can be one of <code>FULL_TIME</code>,{" "}
                  <code>CONTRACT</code>, or <code>INTERN</code>
                </li>
              </ul>
              <div>
                <input
                  type="file"
                  id="file"
                  style={{
                    width: 0.1,
                    height: 0.1,
                    opacity: 0,
                    overflow: "hidden",
                    position: "absolute",
                    zIndex: -1
                  }}
                  onChange={({ target: { files } }) => this.importFiles(files)}
                />
                <FileLabel htmlFor="file">
                  <CloudUpload /> Select a CSV file...
                </FileLabel>
                <label>
                  <input
                    type="checkbox"
                    checked={ignoreEmptyCells}
                    onChange={({ target: { checked } }) =>
                      this.setState({ ignoreEmptyCells: checked })
                    }
                  />{" "}
                  Ignore empty cells
                </label>
              </div>
            </Card>
          </React.Fragment>
        )}
      </section>
    );
  }
}

export const FileLabel = styled.label`
  ${buttonStyles}
`;
