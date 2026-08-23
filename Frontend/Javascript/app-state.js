/* =========================================================
   APP STATE MODULE   (NEW FILE)
   Does NOT modify data.js, navigation.js, validation.js, or
   any existing page. It reads the logged-in user through the
   global functions data.js already provides on every page
   (getCurrentUser, getUnreadCount) - so this works purely by
   ADDING this file to your js/ folder, nothing else required.

   Public API:
     AppState.getState()          -> { user, unreadCount }
     AppState.setState(partial)   -> merges + notifies subscribers
     AppState.subscribe(fn)       -> fn(state) runs on every change
     AppState.refresh()           -> re-syncs from data.js/localStorage
========================================================= */
const AppState = (function () {
  // ---- PRIVATE ----
  let state = { user: null, unreadCount: 0 };
  const listeners = [];

  function notify() {
    listeners.forEach(function (fn) { fn(state); });
  }

  // ---- PUBLIC API ----
  function getState() {
    return state;
  }

  function setState(partial) {
    state = Object.assign({}, state, partial);
    notify();
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function unsubscribe() {
      const i = listeners.indexOf(fn);
      if (i > -1) listeners.splice(i, 1);
    };
  }

  function refresh() {
    if (typeof getCurrentUser !== 'function') return; // data.js not loaded on this page
    const user = getCurrentUser();
    setState({
      user: user,
      unreadCount: user ? getUnreadCount(user.email) : 0
    });
  }

  return { getState: getState, setState: setState, subscribe: subscribe, refresh: refresh };
})();

window.AppState = AppState;
