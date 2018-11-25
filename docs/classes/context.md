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

*Defined in [context.ts:61](https://github.com/JasonEtco/actions-toolkit/blob/6692a29/src/context.ts#L61)*

**Returns:** [Context](context.md)

___

## Properties

<a id="action"></a>

###  action

**● action**: *`string`*

*Defined in [context.ts:60](https://github.com/JasonEtco/actions-toolkit/blob/6692a29/src/context.ts#L60)*

___
<a id="actor"></a>

###  actor

**● actor**: *`string`*

*Defined in [context.ts:61](https://github.com/JasonEtco/actions-toolkit/blob/6692a29/src/context.ts#L61)*

___
<a id="event"></a>

###  event

**● event**: *`string`*

*Defined in [context.ts:56](https://github.com/JasonEtco/actions-toolkit/blob/6692a29/src/context.ts#L56)*

Name of the event that triggered the workflow

___
<a id="payload"></a>

###  payload

**● payload**: *[WebhookPayloadWithRepository](../interfaces/webhookpayloadwithrepository.md)*

*Defined in [context.ts:52](https://github.com/JasonEtco/actions-toolkit/blob/6692a29/src/context.ts#L52)*

Webhook payload object that triggered the workflow

___
<a id="ref"></a>

###  ref

**● ref**: *`string`*

*Defined in [context.ts:58](https://github.com/JasonEtco/actions-toolkit/blob/6692a29/src/context.ts#L58)*

___
<a id="sha"></a>

###  sha

**● sha**: *`string`*

*Defined in [context.ts:57](https://github.com/JasonEtco/actions-toolkit/blob/6692a29/src/context.ts#L57)*

___
<a id="workflow"></a>

###  workflow

**● workflow**: *`string`*

*Defined in [context.ts:59](https://github.com/JasonEtco/actions-toolkit/blob/6692a29/src/context.ts#L59)*

___

## Methods

<a id="issue"></a>

###  issue

▸ **issue**<`T`>(object?: *[T]()*):  `object` & `object` & `T`

*Defined in [context.ts:110](https://github.com/JasonEtco/actions-toolkit/blob/6692a29/src/context.ts#L110)*

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

*Defined in [context.ts:85](https://github.com/JasonEtco/actions-toolkit/blob/6692a29/src/context.ts#L85)*

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

