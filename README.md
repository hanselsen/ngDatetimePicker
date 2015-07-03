# ngDatetimePicker
A modal AngularJS module for picking date and/or times

## Example:
[http://plnkr.co/edit/758e0gM0XaUUgQbtnw20](http://plnkr.co/edit/758e0gM0XaUUgQbtnw20 "Plunkr")

## Usage:

`esds-datepicker` (required): A unique identifier for the date/time-object<br />
`esds-model` (required): Use as `ng-model`<br />
`esds-time` (optional): Set to `false` if time should be disabled (aka datepicker)<br />
`esds-date` (optional): Set to `false` if date should be disabled (aka timepicker)


## Snippets:

**Datetimepicker:**
```
<input
	type="text"
	class="form-control input-sm"
	placeholder="Datepicker.."
	esds-datepicker="myDate"
	esds-time="false"
	esds-model="myDate" />
```

**Datepicker:**
```
<input
	type="text"
	class="form-control input-sm"
	placeholder="Datepicker.."
	esds-datepicker="myDate"
	esds-time="false"
	esds-model="myDate" />
```

**Timepicker:**
```
<input
	type="text"
	class="form-control input-sm"
	placeholder="Timepicker.."
	esds-datepicker="myTime"
	esds-date="false"
	esds-model="myTime" />
```