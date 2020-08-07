/**
 * Take a list of all users and a table of all past games and create a mapping
 * between every two users of the probability that a guesser will guess each choice.
 *
 * TODO use falsePositive, falseNegative, truePositive, trueNegative.
 * @param users
 * @param sparseMatrix
 * @returns {{}}
 */
export const createGame = (users, sparseMatrix = {}) => {
  return users.reduce((probabilities, answer) => {
    const answerColumn = sparseMatrix[answer.id] || {};
    probabilities[answer.id] = users.reduce((accumulator, user) => {
      if (user.id === answer.id) return accumulator;
      const userColumn = sparseMatrix[user.id] || {};
      const userData = answerColumn[user.id] || {};
      const reverseUserData = userColumn[answer.id] || {};

      const answerAppearedWithUser = (reverseUserData.appeared || 0) + 1;
      const answerAccidentallyPickedForUser = (reverseUserData.guessed || 0) + 1;
      const userAppearedWithAnswer = (userData.appeared || 0) + 1;
      const userAccidentallyPicked = (userData.guessed || 0) + 1;

      accumulator[user.id] =
        (userAccidentallyPicked * userAccidentallyPicked) /
          (userAppearedWithAnswer - userAccidentallyPicked + 1) +
        (answerAccidentallyPickedForUser * answerAccidentallyPickedForUser) /
          (answerAppearedWithUser - answerAccidentallyPickedForUser + 1);
      return accumulator;
    }, {});
    return probabilities;
  }, {});
};

/**
 * Update the game matrix with a new guess.
 *
 * @param {Object} sparseMatrix The game matrix
 * @param {String[]} optionIDs IDs shown
 * @param {String} answer Correct ID.
 * @param {String} picked ID picked, right or wrong.
 *
 * @return {Object} game
 */
export const updateGame = (sparseMatrix, optionIDs, answer, picked) => {
  const found = sparseMatrix[answer];
  if (!found) {
    sparseMatrix[answer] = {};
  }

  optionIDs.forEach((option) => {
    const optionFound = sparseMatrix[answer][option];
    if (!optionFound) {
      sparseMatrix[answer][option] = {
        appeared: 0,
        guessed: 0,
      };
    }
    sparseMatrix[answer][option].appeared += 1;
    if (option === picked) {
      sparseMatrix[answer][option].guessed += 1;
    }
  });

  return sparseMatrix;
};

/**
 * Pick `n` options with `m` weighted probabilities. O(n*m).
 * @param {Object} probabilities A map of `id`s to un-normalized probabilities.
 * @param {Number} n How many to pick.
 * @returns {String[]} List of ids
 */
export const pickNWeighted = (probabilities, n) => {
  if (n === 0) return [];
  const ids = Object.keys(probabilities);
  if (ids.length <= n) {
    return ids;
  }

  const total = ids.reduce((total, key) => {
    return total + probabilities[key];
  }, 0);
  let remaining = Math.random() * total;

  let key, value;
  for ([key, value] of Object.entries(probabilities)) {
    remaining -= value;
    if (remaining < 0) break;
  }

  const tail = Object.assign(probabilities);
  delete tail[key];

  return [key].concat(pickNWeighted(tail, n - 1));
};

export const getUserMap = (users) => {
  return users.reduce((accumulator, user) => {
    accumulator[user.id] = {
      id: user.id,
      name: user.name,
    };
    return accumulator;
  }, {});
};
