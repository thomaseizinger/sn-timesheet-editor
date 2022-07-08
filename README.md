# Timesheets with Standard Notes

[Standard Notes](https://standardnotes.com/) is an e2e encrypted note-taking platform that operates on plain text files and provides _editors_ for convenient editing of those files.

This repository contains an editor for maintaining a simple timesheet in CSV format.

## UI

![image](https://user-images.githubusercontent.com/5486389/177994989-8f16fb42-b41d-458f-a5fd-8e3d215b848d.png)

## Installation

Install as a custom editor from this URL: https://eizinger.io/sn-timesheet-editor/ext.json

## Features

The editor only supports adding new entries.
To delete or edit an existing entry, please switch to plain text mode and make the required changes yourself.

## Usage considerations

The implementation is fairly naive and parses the entire note on every change.
Using this editor with very large notes may thus incur performance problems.

Personally, I create a new note per month to avoid this problem.
PRs to implement more efficient parsing and/or a better data model will gladly be accepted.
