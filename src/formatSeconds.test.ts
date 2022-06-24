import formatSeconds from './formatSeconds';

test.each([
  [10, '10s'],
  [70, '1m 10s'],
  [230, '3m 50s'],
  [3680, '1h 1m 20s'],
  [3601, '1h 1s'],
])('formatSeconds(%i) == %s', (seconds, expected) => {
  let actual = formatSeconds(seconds);

  expect(actual).toStrictEqual(expected);
});
