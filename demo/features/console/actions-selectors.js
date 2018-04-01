export const mountPoint = "console";

export const selectConsole = store => store.get(mountPoint) || "";

export const logMessage = (store, _, message) => {
  setTimeout(
    () => store.set(mountPoint, selectConsole(store) + "\n" + message),
    0
  );
};

export const clearConsole = store => store.set(mountPoint, "");
