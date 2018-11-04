[actions-toolkit](../README.md) > [Context](../classes/context.md)

# Class: Context

## Hierarchy

**Context**

## Index

### Constructors

* [constructor](context.md#constructor)

### Properties

* [payload](context.md#payload)
* [ref](context.md#ref)
* [sha](context.md#sha)

### Methods

* [issue](context.md#issue)
* [repo](context.md#repo)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Context**(): [Context](context.md)

*Defined in [context.ts:4](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/context.ts#L4)*

**Returns:** [Context](context.md)

___

## Properties

<a id="payload"></a>

###  payload

**● payload**: *`any`*

*Defined in [context.ts:2](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/context.ts#L2)*

___
<a id="ref"></a>

###  ref

**● ref**: * `string` &#124; `undefined`
*

*Defined in [context.ts:4](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/context.ts#L4)*

___
<a id="sha"></a>

###  sha

**● sha**: * `string` &#124; `undefined`
*

*Defined in [context.ts:3](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/context.ts#L3)*

___

## Methods

<a id="issue"></a>

###  issue

▸ **issue**(object: *`object`*): `object`

*Defined in [context.ts:54](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/context.ts#L54)*

Return the `owner`, `repo`, and `number` params for making API requests against an issue or pull request. The object passed in will be merged with the repo params.

```js
const params = context.issue({body: 'Hello World!'})
// Returns: {owner: 'username', repo: 'reponame', number: 123, body: 'Hello World!'}
```

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| object | `object` |  Params to be merged with the issue params. |

**Returns:** `object`

___
<a id="repo"></a>

###  repo

▸ **repo**(object: *`object`*): `object`

*Defined in [context.ts:24](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/context.ts#L24)*

Return the `owner` and `repo` params for making API requests against a repository.

```js
const params = context.repo({path: '.github/config.yml'})
// Returns: {owner: 'username', repo: 'reponame', path: '.github/config.yml'}
```

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| object | `object` |  Params to be merged with the repo params.<br><br> |

**Returns:** `object`

___

