const listToIndexedDictionary = <T>(list: T[]): Record<number, T> => {
    return list.reduce((dict, item, index) => {
        dict[index] = item;
        return dict;
    }, {} as Record<number, T>);
};

export default listToIndexedDictionary;
