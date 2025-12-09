const addNumberPrefix = (num: number): string => {
    return num > 0 ? `+${num}` : `${num}`;
};

export { addNumberPrefix };