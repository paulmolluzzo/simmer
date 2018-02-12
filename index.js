function simmer (reducer, input) {
  // if there is no input return a curried simmer waiting for the input
  if (typeof input === 'undefined') {
    return function curriedSimmer (expectedInput) {
      return simmer(reducer, expectedInput)
    }
  }

  if (Array.isArray(reducer)) {
    return simmer(reducer.shift(), input).then(
      newInput =>
        // if there are no more reducers then return the final result
        reducer.length > 0 ? simmer(reducer, newInput) : newInput
    )
  }

  return new Promise(resolve => resolve(reducer(input)))
}

module.exports = simmer
