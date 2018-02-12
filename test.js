/* eslint-env jest */

const simmer = require('./')
const exponentialGrowth = input => input * input

describe('simmer', () => {
  test('it uses the input as an arg if a fn is provided', () => {
    const input = 1
    const testFunction = jest.fn()

    return simmer(testFunction, input).then(result => {
      expect(testFunction).toBeCalledWith(input)
    })
  })

  test('it returns function result of passed function', () => {
    const input = 5

    return simmer(exponentialGrowth, input).then(result => {
      expect(result).toBe(25)
    })
  })

  test('it reduces array of functions result of passed function', () => {
    const input = 2

    return simmer(
      [exponentialGrowth, exponentialGrowth, exponentialGrowth],
      input
    ).then(result => {
      expect(result).toBe(256)
    })
  })

  test('it returns a curried simmer if the input is omitted', () => {
    const curriedFn = simmer([
      exponentialGrowth,
      exponentialGrowth,
      exponentialGrowth
    ])

    expect(curriedFn).toBeInstanceOf(Function)
    return curriedFn(2).then(result => {
      expect(result).toBe(256)
    })
  })

  test('it reduces nested arrays of functions result of passed function', () => {
    const input = 2

    return simmer(
      [
        exponentialGrowth,
        [exponentialGrowth, exponentialGrowth, exponentialGrowth],
        exponentialGrowth
      ],
      input
    ).then(result => {
      expect(result).toBe(4294967296)
    })
  })

  test('it reduces object with key/values that accept input', () => {
    const input = {
      a: {
        b: 1
      },
      b: {
        c: {
          d: 2
        }
      }
    }

    const mappingExample = i => ({
      a: i.a.b,
      b: i.b.c.d,
      c: 'some string'
    })

    return simmer(mappingExample, input).then(result => {
      expect(result).toEqual({
        a: 1,
        b: 2,
        c: 'some string'
      })
    })
  })

  test('it manipulates objects with an array of functions', () => {
    const input = {
      a: {
        b: 2
      },
      b: {
        c: {
          d: 4
        }
      }
    }

    const mapObject = i => ({
      a: i.a.b,
      b: i.b.c.d,
      c: 'some string'
    })

    const reorgObject = i => ({
      a: {
        a: i.a,
        b: i.b,
        c: i.c
      },
      b: 'new string'
    })

    const reorgObjectAgain = i =>
      Object.assign({}, i, {
        c: 'another new string'
      })

    const growObject = i => ({
      a: {
        a: exponentialGrowth(i.a.a),
        b: exponentialGrowth(i.a.b),
        c: i.a.c
      },
      b: i.b,
      c: i.c
    })

    return simmer(
      [mapObject, reorgObject, reorgObjectAgain, growObject],
      input
    ).then(result => {
      expect(result).toEqual({
        a: {
          a: 4,
          b: 16,
          c: 'some string'
        },
        b: 'new string',
        c: 'another new string'
      })
    })
  })

  test('it handles errors in complex scenarios', () => {
    const input = {
      a: {
        b: 2
      },
      b: {
        c: {
          d: 4
        }
      }
    }

    const mapObject = i => ({
      a: i.a.b,
      b: i.c.a, // undefined value
      c: 'some string'
    })

    const reorgObject = i => ({
      a: {
        a: i.a,
        b: i.b,
        c: i.c
      },
      b: 'new string'
    })

    const reorgObjectAgain = i => {
      Object.assign({}, i, {
        c: 'another new string'
      })
    }

    const growObject = i => ({
      a: {
        a: exponentialGrowth(i.a.a),
        b: exponentialGrowth(i.a.b),
        c: i.a.c
      },
      b: i.b,
      c: i.c
    })

    return simmer(
      [mapObject, reorgObject, reorgObjectAgain, growObject],
      input
    ).catch(error => {
      expect(error).toMatchSnapshot()
    })
  })

  test('it handles the example in the README', () => {
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

    return simmer(
      [validateInput, createName, linkifyTwitter, removeTitle, validateOutput],
      input
    ).then(result => {
      expect(result).toMatchSnapshot()
    })
  })

  test('it handles errors in the example in the README', () => {
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

    const validateOutput = input => {
      if (input.title) {
        throw new Error('Titles should be removed!')
      }

      return input
    }

    // validation expects that the removeTitle function was called, but we never included it
    return simmer(
      [validateInput, createName, linkifyTwitter, validateOutput],
      input
    ).catch(error => {
      expect(error).toMatchSnapshot()
    })
  })
})
