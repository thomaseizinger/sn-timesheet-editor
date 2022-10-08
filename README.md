# Timesheets with Standard Notes

[Standard Notes](https://standardnotes.com/) is an e2e encrypted note-taking platform that operates on plain text files and provides _editors_ for convenient editing of those files.

This repository contains an editor for maintaining a simple timesheet in CSV format.

## UI

![Screenshot from 2022-10-08 17-40-44](https://user-images.githubusercontent.com/5486389/194693791-c51953ef-979a-44dd-bd9a-4430a1f757cc.png)

## Installation

Install as a custom editor from this URL: https://eizinger.io/sn-timesheet-editor/ext.json

## Features

- The currently running record is highlighted in green.
- Each project has a separate "Start timer" button to resume work on it.
- The total of duration is displayed in the note preview.

To delete or edit an something, please switch to plain text mode.

## Usage considerations

The implementation is fairly naive and parses the entire note on every change.
Using this editor with very large notes may thus incur performance problems.

Personally, I create a new note per month to avoid this problem.
PRs to implement more efficient parsing and/or a better data model will gladly be accepted.
