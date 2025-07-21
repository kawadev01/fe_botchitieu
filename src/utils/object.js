export const setNestedValue = (obj, path, value) => {
    const keys = path.split(".");
    const lastKey = keys.pop();

    const newObj = { ...obj };
    let pointer = newObj;

    for (const key of keys) {
        pointer[key] = { ...pointer[key] };
        pointer = pointer[key];
    }

    pointer[lastKey] = value;
    return newObj;
};