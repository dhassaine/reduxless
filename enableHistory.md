# Syncing the browser history and URL
> `enableHistory(store, [twoWayBindings], [oneWayBindings])`

The `twoWayBindings` array contains top level properties (or mountpoints) in the store which will be used to restore the store state when the URL changes and also when the store changes will update the URL and broswer history. A good use-case would be whether a side menu component is open/closed: `enableHistory(store, ['isSideMenuOpen'])`. When you load the URL for the first time the Reduxless store will attempt to read the `isSideMenuOpen` property from the URL. Any actions that modify `isSideMenuOpen` will also update the URL with a `pushState` event. Navigating the browser history backwards/forwards will update the store.

The `oneWayBindings` array contains mountpoints which will only be used to initialise the store and when the store changes the URL will be updated using the `replaceState` event which effectively means the changes aren't recorded in the browser history. A use-case might be a mountpoint representing the scroll position in your app: you want the app to remember the last position but syncing every scroll event in the browser history would render the history useless.

