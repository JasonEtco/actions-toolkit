[actions-toolkit](../README.md) > [Context](../classes/context.md)

# Class: Context

## Hierarchy

**Context**

## Index

### Constructors

* [constructor](context.md#constructor)

### Properties

* [action](context.md#action)
* [actor](context.md#actor)
* [event](context.md#event)
* [payload](context.md#payload)
* [ref](context.md#ref)
* [sha](context.md#sha)
* [workflow](context.md#workflow)

### Methods

* [issue](context.md#issue)
* [repo](context.md#repo)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Context**(): [Context](context.md)

*Defined in [context.ts:16](https://github.com/JasonEtco/actions-toolkit/blob/ca68c60/src/context.ts#L16)*

**Returns:** [Context](context.md)

___

## Properties

<a id="action"></a>

###  action

**● action**: *`string`*

*Defined in [context.ts:15](https://github.com/JasonEtco/actions-toolkit/blob/ca68c60/src/context.ts#L15)*

___
<a id="actor"></a>

###  actor

**● actor**: *`string`*

*Defined in [context.ts:16](https://github.com/JasonEtco/actions-toolkit/blob/ca68c60/src/context.ts#L16)*

___
<a id="event"></a>

###  event

**● event**: *`string`*

*Defined in [context.ts:11](https://github.com/JasonEtco/actions-toolkit/blob/ca68c60/src/context.ts#L11)*

Name of the event that triggered the workflow

___
<a id="payload"></a>

###  payload

**● payload**: *`WebhookPayloadWithRepository`*

*Defined in [context.ts:7](https://github.com/JasonEtco/actions-toolkit/blob/ca68c60/src/context.ts#L7)*

Webhook payload object that triggered the workflow

___
<a id="ref"></a>

###  ref

**● ref**: *`string`*

*Defined in [context.ts:13](https://github.com/JasonEtco/actions-toolkit/blob/ca68c60/src/context.ts#L13)*

___
<a id="sha"></a>

###  sha

**● sha**: *`string`*

*Defined in [context.ts:12](https://github.com/JasonEtco/actions-toolkit/blob/ca68c60/src/context.ts#L12)*

___
<a id="workflow"></a>

###  workflow

**● workflow**: *`string`*

*Defined in [context.ts:14](https://github.com/JasonEtco/actions-toolkit/blob/ca68c60/src/context.ts#L14)*

___

## Methods

<a id="issue"></a>

###  issue

▸ **issue**<`T`>(object?: *[T]()*):  `object` & `object` & `T`

*Defined in [context.ts:65](https://github.com/JasonEtco/actions-toolkit/blob/ca68c60/src/context.ts#L65)*

Return the `owner`, `repo`, and `number` params for making API requests against an issue or pull request. The object passed in will be merged with the repo params.

```js
const params = context.issue({body: 'Hello World!'})
// Returns: {owner: 'username', repo: 'reponame', number: 123, body: 'Hello World!'}
```

**Type parameters:**

#### T 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` object | [T]() |  Params to be merged with the issue params. |

**Returns:**  `object` & `object` & `T`

___
<a id="repo"></a>

###  repo

▸ **repo**<`T`>(object?: *[T]()*):  `object` & `T`

*Defined in [context.ts:40](https://github.com/JasonEtco/actions-toolkit/blob/ca68c60/src/context.ts#L40)*

Return the `owner` and `repo` params for making API requests against a repository.

```js
const params = context.repo({path: '.github/config.yml'})
// Returns: {owner: 'username', repo: 'reponame', path: '.github/config.yml'}
```

**Type parameters:**

#### T 
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| `Optional` object | [T]() |  Params to be merged with the repo params.<br><br> |

**Returns:**  `object` & `T`

___

