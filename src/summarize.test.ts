import summarize from './summarize';

it('computes the duration in seconds for each row and returns a new CSV string', () => {
  const inputCSV = `5,3715,2023-04-03T13:50:03.357Z,2023-04-03T14:30:10.645Z
4,reviews,2023-04-03T13:29:32.027Z,2023-04-03T13:50:00.974Z
3,3659,2023-04-03T10:07:29.829Z,2023-04-03T10:19:54.459Z
2,meetings,2023-04-02T18:14:45.318Z,2023-04-02T18:39:26.453Z
1,reviews,2023-04-02T15:57:53.194Z,2023-04-02T16:26:54.916Z`;

  const expectedOutputCSV = `Item,Duration
reviews,2971
3715,2407
meetings,1481
3659,745`;

  const outputCSV = summarize(inputCSV);

  expect(outputCSV).toEqual(expectedOutputCSV);
});
