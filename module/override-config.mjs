import { MODULE } from "./config.mjs";
import { GetCategories, GetNonDefaultItems } from "./helper.mjs";

export default class ManualOverrideConfig extends FormApplication {
  /** @inheritdoc */
  constructor(object = {}, options = {}) {
    object = foundry.utils.mergeObject({
      categories: game.settings.get(MODULE.id, MODULE.setting.categories),
      items: game.settings.get(MODULE.id, MODULE.setting.items)
    }, object, { inplace: false });
    super(object, options);
  }

  static CategoryDropdown = {};
  static ProfDropdown = {};

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: game.i18n.localize("EQUIPMENTSLOTS.MENU.title"),
      classes: [MODULE.id, MODULE.menu],
      id: MODULE.menu,
      template: "modules/deyzerias-equipment-slots/templates/manual-override-config.hbs",
      popOut: true,
      width: 800,
      height: "auto"
    });
  }

  getData(options = {}) {
    const context = super.getData(options);

    const hideDefault = game.settings.get(MODULE.id, MODULE.setting.fulldisable);

    context.categories = [];
    for (const [name, obj] of Object.entries(context.object.categories)) {
      context.categories.push({
        name: obj.name ?? name,
        label: game.i18n.localize(obj.label),
        enabled: obj.value,
        module: obj?.module ?? false,
        moduleordefault: obj.default || (obj?.module ?? false),
        hide: obj.default && hideDefault ? "hide" : ""
      });
    }

    const categories = hideDefault ? GetNonDefaultItems(context.object.categories) : context.object.categories;
    this.CategoryDropdown = context.categoryDropdown = GetCategories(categories, true, true);
    const arProf = CONFIG.DND5E.armorProficiencies;
    delete arProf.shl;
    this.ProfDropdown = context.profDropdown = GetCategories(arProf, false);

    context.items = []
    for (const [name, obj] of Object.entries(context.object.items)) {
      context.items.push({
        name: obj.name ?? name,
        label: game.i18n.localize(obj.label),
        category: obj.category,
        prof: typeof obj.prof === "boolean" ? "" : obj.prof,
        enabled: obj.value,
        module: obj?.module ?? false,
        moduleordefault: obj.default || (obj?.module ?? false),
        hide: obj.default && hideDefault ? "hide" : ""
      });
    }
    console.debug(context);
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", "[data-action]", this._onAction.bind(this));
  }

  _onAction(event) {
    const action = event.currentTarget.dataset.action;
    if (action == "add-button") {
      const type = event.currentTarget.dataset.type;

      const lastChild = $(event.currentTarget).parent().find("[data-id]").last();
      const tempId = foundry.utils.randomID(8);

      const inputSettings = {
        required: true,
        value: ""
      }

      const newChild = $(`<li class="flexrow" data-id="${tempId}"></li>`);
      const nameInput = foundry.applications.fields.createTextInput({ ...inputSettings, name: `${type}.${tempId}.name` });
      newChild.append(nameInput);
      const labelInput = foundry.applications.fields.createTextInput({ ...inputSettings, name: `${type}.${tempId}.label` });
      newChild.append(labelInput);

      if (type == "items") {
        const categoryDropdown = foundry.applications.fields.createSelectInput({ options: this.CategoryDropdown, blank: "", sort: false, name: `items.${tempId}.category`, value: "" });
        $(categoryDropdown).addClass("largeSelect");
        newChild.append(categoryDropdown);
        const profDropdown = foundry.applications.fields.createSelectInput({ options: this.ProfDropdown, blank: "Always", sort: false, name: `items.${tempId}.prof`, value: "" });
        newChild.append(profDropdown);
      }

      const checkboxInput = foundry.applications.fields.createCheckboxInput({ name: `${type}.${tempId}.value` });
      checkboxInput.checked = true
      newChild.append(checkboxInput);
      const deleteButton = $(`<a class="columnDelete" data-action="delete-button"><i class="fa-solid fa-trash"></i></a>`)
      newChild.append(deleteButton);
      lastChild.after(newChild);
    }
    if (action == "delete-button") {
      $(event.currentTarget).parent().remove();
    }
  }

  async _updateObject(event, formData) {
    let output = foundry.utils.expandObject(formData);

    console.debug(output);

    // Categories
    const newCategoryData = Object.fromEntries(
      Object.entries(
        foundry.utils.mergeObject(game.settings.get(MODULE.id, MODULE.setting.categories), output.categories, { override: true })
      )
        .filter(([key]) => Object.keys(output.categories).includes(key))
        .map(([key, obj]) => {
          if (obj.default === undefined) {
            return [
              obj.name,
              {
                label: obj.label,
                value: obj.value,
                default: false
              }
            ]
          }
          return [key, obj];
        })
    );
    game.settings.set(MODULE.id, MODULE.setting.categories, newCategoryData);

    // Items
    const newItemData = Object.fromEntries(
      Object.entries(
        foundry.utils.mergeObject(game.settings.get(MODULE.id, MODULE.setting.items), output.items, { override: true })
      )
        .filter(([key]) => Object.keys(output.items).includes(key))
        .map(([key, obj]) => {
          if (obj.default === undefined) {
            return [
              obj.name,
              {
                label: obj.label,
                value: obj.value,
                category: obj.category,
                prof: obj.prof !== "" ? obj.prof : true,
                default: false
              }
            ]
          }
          return [obj.name ?? key, obj];
        })
    );
    console.debug(newItemData);
    game.settings.set(MODULE.id, MODULE.setting.items, newItemData);

    return SettingsConfig.reloadConfirm({ world: true });
  }
}