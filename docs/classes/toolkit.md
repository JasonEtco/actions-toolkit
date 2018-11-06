[actions-toolkit](../README.md) > [Toolkit](../classes/toolkit.md)

# Class: Toolkit

## Hierarchy

**Toolkit**

## Index

### Constructors

* [constructor](toolkit.md#constructor)

### Properties

* [context](toolkit.md#context)
* [token](toolkit.md#token)
* [warning](toolkit.md#warning)
* [workspace](toolkit.md#workspace)

### Methods

* [config](toolkit.md#config)
* [createOctokit](toolkit.md#createoctokit)
* [getFile](toolkit.md#getfile)
* [getPackageJSON](toolkit.md#getpackagejson)
* [runInWorkspace](toolkit.md#runinworkspace)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Toolkit**(): [Toolkit](toolkit.md)

*Defined in [index.ts:23](https://github.com/JasonEtco/actions-toolkit/blob/25e3be0/src/index.ts#L23)*

**Returns:** [Toolkit](toolkit.md)

___

## Properties

<a id="context"></a>

###  context

**● context**: *[Context](context.md)*

*Defined in [index.ts:9](https://github.com/JasonEtco/actions-toolkit/blob/25e3be0/src/index.ts#L9)*

___
<a id="token"></a>

###  token

**● token**: *`string`*

*Defined in [index.ts:23](https://github.com/JasonEtco/actions-toolkit/blob/25e3be0/src/index.ts#L23)*

GitHub API token

___
<a id="warning"></a>

###  warning

**● warning**: * `string` &#124; `undefined`
*

*Defined in [index.ts:14](https://github.com/JasonEtco/actions-toolkit/blob/25e3be0/src/index.ts#L14)*

A warning string that is memoized if there are missing environment variables

___
<a id="workspace"></a>

###  workspace

**● workspace**: *`string`*

*Defined in [index.ts:19](https://github.com/JasonEtco/actions-toolkit/blob/25e3be0/src/index.ts#L19)*

Path to a clone of the repository

___

## Methods

<a id="config"></a>

###  config

▸ **config**(key: *`string`*): `object`

*Defined in [index.ts:109](https://github.com/JasonEtco/actions-toolkit/blob/25e3be0/src/index.ts#L109)*

Get the configuration settings for this action in the project workspace.
*__example__*: This method can be used in three different ways:

```js
// Get the .rc file
const cfg = toolkit.config('.myactionrc')

// Get the YAML file
const cfg = toolkit.config('myaction.yml')

// Get the property in package.json
const cfg = toolkit.config('myaction')
```

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| key | `string` |  If this is a string like \`.myfilerc\` it will look for that file. If it's a YAML file, it will parse that file as a JSON object. Otherwise, it will return the value of the property in the \`package.json\` file of the project. |

**Returns:** `object`

___
<a id="createoctokit"></a>

###  createOctokit

▸ **createOctokit**(): `Github`

*Defined in [index.ts:45](https://github.com/JasonEtco/actions-toolkit/blob/25e3be0/src/index.ts#L45)*

Returns an Octokit SDK client authenticated for this repository. See [https://octokit.github.io/rest.js](https://octokit.github.io/rest.js) for the API.

```js
const octokit = tools.createOctokit()
const newIssue = await octokit.issues.create(context.repo({
  title: 'New issue!',
  body: 'Hello Universe!'
}))
```

**Returns:** `Github`

___
<a id="getfile"></a>

###  getFile

▸ **getFile**(filename: *`string`*, encoding?: *`string`*): `string`

*Defined in [index.ts:70](https://github.com/JasonEtco/actions-toolkit/blob/25e3be0/src/index.ts#L70)*

Gets the contents file in your project's workspace

```js
const myFile = tools.getFile('README.md')
```

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| filename | `string` | - |  Name of the file |
| `Default value` encoding | `string` | &quot;utf8&quot; |  Encoding (usually utf8) |

**Returns:** `string`

___
<a id="getpackagejson"></a>

###  getPackageJSON

▸ **getPackageJSON**(): `object`

*Defined in [index.ts:83](https://github.com/JasonEtco/actions-toolkit/blob/25e3be0/src/index.ts#L83)*

Get the package.json file in the project root

```js
const pkg = toolkit.getPackageJSON()
```

**Returns:** `object`

___
<a id="runinworkspace"></a>

###  runInWorkspace

▸ **runInWorkspace**(command: *`string`*, args?: * `string`[] &#124; `string`*, opts?: *`ExecaOptions`*): `Promise`<`ExecaReturns`>

*Defined in [index.ts:132](https://github.com/JasonEtco/actions-toolkit/blob/25e3be0/src/index.ts#L132)*

Run a CLI command in the workspace. This runs [execa](https://github.com/sindresorhus/execa) under the hood so check there for the full options.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| command | `string` |  Command to run |
| `Optional` args |  `string`[] &#124; `string`|  Argument (this can be a string or multiple arguments in an array) |
| `Optional` opts | `ExecaOptions` |

**Returns:** `Promise`<`ExecaReturns`>

___

