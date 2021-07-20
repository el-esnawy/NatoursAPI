module.exports = async (fn) => {
  try {
    const response = await fn();
    return [response, null];
  } catch (error) {
    console.log(error);
    return [null, error];
  }
};
