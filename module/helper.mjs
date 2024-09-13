export function GetNonDefaultItems(object) {
  return Object.fromEntries(
    Object.entries(object)
      .filter(([key, value]) => value.default == false)
  ) ?? {}
}

export function GetCategories(categories, checkValue, translate) {
  const returnArray = [];
  for (const [id, obj] of Object.entries(categories)) {
    if (checkValue ? obj.value : true) {
      let label = checkValue ? obj.label : obj;
      let labelTr = translate ? game.i18n.localize(label) : label;
      returnArray.push({ value: id, label: labelTr });
    }
  }
  return returnArray;
}