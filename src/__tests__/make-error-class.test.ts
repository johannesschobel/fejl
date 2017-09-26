import { throws } from 'smid'
import { MakeErrorClass } from '../make-error-class'

describe('MakeErrorClass', () => {
  it('uses the specified class name', () => {
    class Test extends MakeErrorClass('This is a test') {}

    const err = throws(() => { throw new Test() })
    expect(Test.name).toBe('Test')
    expect(err.name).toBe('Test')
  })

  it('assigns default message and attributes', () => {
    class Test extends MakeErrorClass('This is a test', { statusCode: 400 }) {}

    const err = throws<Test>(() => {
      throw new Test()
    })
    expect(err.message).toBe('This is a test')
    expect(err.statusCode).toBe(400)
  })

  describe('assert', () => {
    class Test extends MakeErrorClass('This is a test', { statusCode: 400 }) {}

    it('throws the correct error', () => {
      const err = throws<Test>(() => Test.assert(false, 'Oh no'))
      expect(err.message).toBe('Oh no')
    })

    it('returns the value when truthy', () => {
      expect(Test.assert(1337, 'Not leet')).toBe(1337)
    })
  })

  describe('makeAssert', () => {
    class Test extends MakeErrorClass('This is a test', { statusCode: 400 }) {}

    it('returns an asserter function', () => {
      const assert = Test.makeAssert('Nope')
      const err = throws<Test>(() => assert(false))
      expect(err.statusCode).toBe(400)
      expect(err.message).toBe('Nope')

      expect(assert(1337)).toBe(1337)
    })
  })

  describe('toJSON', () => {
    class Test extends MakeErrorClass('This is a test', { statusCode: 400 }) {}

    it('returns a plain object with props', () => {
      const err = new Test('Woops', { other: 'stuff' } as any)
      const json = err.toJSON() as any
      expect(json.message).toBe('Woops')
      expect(json.statusCode).toBe(400)
      expect(json.other).toBe('stuff')
      expect(json.stack).toEqual(expect.anything())
    })

    it('can override toJSON', () => {
      class Overrider extends Test {
        toJSON () {
          return { message: 'This is not the error you be lookin for' }
        }
      }

      const err = new Overrider('Oh no')
      const json = err.toJSON()
      expect(Object.keys(json)).toEqual(['message'])
    })

    it('can call super.toJSON', () => {
      class Overrider extends Test {
        toJSON () {
          return {
            ...super.toJSON(),
            surprise: true
          }
        }
      }

      const err = new Overrider('Oh no')
      const json = err.toJSON() as any
      expect(json.message).toBe('Oh no')
      expect(json).toHaveProperty('stack')
      expect(json.surprise).toBe(true)
    })
  })
})
