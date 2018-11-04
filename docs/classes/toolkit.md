[actions-toolkit](../README.md) > [Toolkit](../classes/toolkit.md)

# Class: Toolkit

## Hierarchy

**Toolkit**

## Index

### Constructors

* [constructor](toolkit.md#constructor)

### Properties

* [context](toolkit.md#context)
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

*Defined in [toolkit.ts:14](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/toolkit.ts#L14)*

**Returns:** [Toolkit](toolkit.md)

___

## Properties

<a id="context"></a>

###  context

**● context**: *[Context](context.md)*

*Defined in [toolkit.ts:9](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/toolkit.ts#L9)*

___
<a id="workspace"></a>

###  workspace

**● workspace**: * `string` &#124; `undefined`
*

*Defined in [toolkit.ts:14](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/toolkit.ts#L14)*

Path to a clone of the repository

___

## Methods

<a id="config"></a>

###  config

▸ **config**(key: *`string`*): `object`

*Defined in [toolkit.ts:88](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/toolkit.ts#L88)*

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
| key | `string` |  If this is a string like \`.myfilerc\` it will look for that file. If it is a YAML file, it will return it as JSON. Otherwise, it will return the value of the property in the \`package.json\` file of the project. |

**Returns:** `object`

___
<a id="createoctokit"></a>

###  createOctokit

▸ **createOctokit**(): `Github`

*Defined in [toolkit.ts:24](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/toolkit.ts#L24)*

Returns an authenticated Octokit client.

**Returns:** `Github`

___
<a id="getfile"></a>

###  getFile

▸ **getFile**(filename: *`string`*, encoding?: *`string`*): `string`

*Defined in [toolkit.ts:45](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/toolkit.ts#L45)*

Gets a file in your project's workspace

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

*Defined in [toolkit.ts:60](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/toolkit.ts#L60)*

Get the package.json file in the project root

```js
const pkg = toolkit.getPackageJSON()
```

**Returns:** `object`

___
<a id="runinworkspace"></a>

###  runInWorkspace

▸ **runInWorkspace**(command: *`string`*, args: *`string`[]*, cwd?: * `undefined` &#124; `string`*, opts: *`object`*): `Promise`<`ExecaReturns`>

*Defined in [toolkit.ts:114](https://github.com/JasonEtco/actions-toolkit/blob/d6f052c/src/toolkit.ts#L114)*

Run a CLI command in the workspace

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| command | `string` | - |  Command to run |
| args | `string`[] | - |  Arguments |
| `Default value` cwd |  `undefined` &#124; `string`|  this.workspace |  Directory to run the command in |
| opts | `object` | - |  \- |

**Returns:** `Promise`<`ExecaReturns`>

___

