# simmer 🍳 [![Build Status](https://travis-ci.org/paulmolluzzo/simmer.svg?branch=master)](https://travis-ci.org/paulmolluzzo/simmer)

> Put something in, reduce it down, and use the output

## Install

```
$ npm install --save simmer
```

## Usage

```js
const simmer = require('simmer')
const addExclamation = i => i + '!'

simmer([i => `Hello ${i}`, addExclamation], 'World') // 'Hello World!'
```

`simmer` provides a single utility function that accepts a function or array of functions and an input to pass to the function or first function in the array.

If a single function is provided, `simmer` returns a Promise of the function with the input as the argument.

If an array of functions is provided then `simmer` recursively executes each function in the array, passing the initial input or the result of the preceeding function as the argument.

## Why Use This?

`simmmer` is just a utility, but it provides opportunity to write interesting code with small building blocks.

### Validate and format objects

Want to accept some data, mutate that data, then validate that it fits a shape/schema? `simmer` makes it easy to create a list of functions and pass in data that will pass through the functions in order.

```js
const input = {
  firstName: 'Paul',
  lastName: 'Molluzzo',
  title: 'JavaScript Developer',
  twitter: 'paulmolluzzo'
}

const validateInput = input => {
  if (!input.firstName || !input.lastName) {
    throw new Error('Expected an object with a first and last name')
  }

  return input
}

const createName = input => {
  input.fullName = [input.firstName, input.lastName].join(' ')
  return input
}

const linkifyTwitter = input => {
  input.twitter = `https://twitter.com/${input.twitter}`
  return input
}

const removeTitle = input => {
  delete input.title
  return input
}

const validateOutput = input => {
  if (input.title) {
    throw new Error('Titles should be removed!')
  }

  return input
}

simmer([validateInput, createName, linkifyTwitter, removeTitle, validateOutput], input)
  .then(r => {
    console.log(r) // {"fullName": "Paul Molluzzo", firstName: "Paul", lastName: "Molluzzo", "twitter": "https://twitter.com/paulmolluzzo"}
  })
```

### Create a Curried Function

Using the same example above, it's possible to create a curried version of the same functionality by calling `simmer` with no `input`.

```js
const curriedExample = simmer([validateInput, createName, linkifyTwitter, removeTitle, validateOutput])

// delicious!
curriedExample({
  firstName: 'Paul',
  lastName: 'Molluzzo',
  title: 'JavaScript Developer',
  twitter: 'paulmolluzzo'
})
```

## Acknowledgements

This work is heavily inspired by [DataPoint](https://github.com/ViacomInc/data-point/), in particular the `ListReducer`, `FunctionReducer`, and enlightening discussions with [Acatl Pacheco](https://github.com/acatl) and [Matthew Armstrong](https://github.com/raingerber). 🙌🙌🙌

## License

MIT © [Paul Molluzzo](https://paul.molluzzo.com)
