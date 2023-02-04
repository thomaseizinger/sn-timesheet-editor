# Timesheets with Standard Notes

[Standard Notes](https://standardnotes.com/) is an e2e encrypted note-taking platform that operates on plain text files and provides _editors_ for convenient editing of those files.

This repository contains an editor for maintaining a simple timesheet in CSV format.

## UI

| Overview                                                                                                                                     | Recording                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Screenshot from 2023-02-04 15-07-44](https://user-images.githubusercontent.com/5486389/216740894-cf370560-d652-49be-945d-7fa57d6f8735.png) | ![Screenshot from 2023-02-04 15-07-52](https://user-images.githubusercontent.com/5486389/216740900-db7cf9b5-d857-4772-83dd-600db1376f34.png) |

## Installation

Install as a custom editor from this URL: https://eizinger.io/sn-timesheet-editor/ext.json

## Features

- Starting to record will switch to a different view
- The start time can be adjusted +1/-1 minute
- Current recording can be aborted using "Discard" button
- Each project has a separate "Start timer" button to resume work on it.
- The total of duration is displayed in the note preview.

To delete or edit something, please switch to plain text mode.

## Usage considerations

The implementation is fairly naive and parses the entire note on every change.
Using this editor with very large notes may thus incur performance problems.

Personally, I create a new note per month to avoid this problem.
PRs to implement more efficient parsing and/or a better data model will gladly be accepted.
