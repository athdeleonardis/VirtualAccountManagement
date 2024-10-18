export const insert = <T>(array: T[], index: number, element: T): T[] => {
  return [
    ...array.slice(0,index),
    element,
    ...array.slice(index,array.length)
  ];
}
