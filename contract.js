const functions = { add, remove }

export function handle(state, action) {
  if (Object.keys(functions).includes(action.input.function)) {
    return functions[action.input.function](state, action)
  }
  throw new ContractError(`No function supplied or function not recognised: "${input.function}"`);
}

/** 
 * adds transaction from favorites list
 * caller must be the owner
 * tx must not exist in the list
 */
function add(state, action) {

  if (action.input.tx && action.caller === state.owner && !state.favorites.includes(action.input.tx)) {
    state.favorites = [...state.favorites, action.input.tx]
  }
  return { state }
}

/** 
 * removes transaction from favorites list
 * caller must be the owner
 */
function remove(state, action) {
  if (action.input.tx && action.caller === state.owner) {
    state.favorites = state.favorites.filter(f => f !== action.input.tx)
  }
  return { state }
}