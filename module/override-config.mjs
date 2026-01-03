import { MODULE } from "./config.mjs";
import { GetCategories, GetNonDefaultItems } from "./helper.mjs";
const { ApplicationV2, DialogV2, HandlebarsApplicationMixin } = foundry.applications.api;

const PATH = "modules/deyzerias-equipment-slots/templates";

export default class ManualOverrideConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @inheritdoc */
  constructor(options = {}) {
    super(options);
    this.defaultCategories = game.settings.get(MODULE.id, MODULE.setting.categories);
    this.defaultItems = game.settings.get(MODULE.id, MODULE.setting.items);
    return this;
  }

  static CategoryDropdown = {};
  static ProfDropdown = {};

  static DEFAULT_OPTIONS = {
    id: MODULE.menu,
    tag: "form",
    window: {
      title: "EQUIPMENTSLOTS.MENU.title",
      contentClasses: [MODULE.id, MODULE.menu]
    },
    position: {
      width: 805,
      height: "auto"
    },
    form: {
      // closeOnSubmit: true,
      handler: this.#onSubmit
    },
    actions: {
      addButton: this.#addButton,
      addCategory: this.#addButtonCategory,
      deleteButton: this.#deleteButton
    }
  }

  static PARTS = {
    body: {
      template: `${PATH}/manual-override-config.hbs`
    },
    footer: {
      template: `${PATH}/footer.hbs`
    }
  }

  get title() {
    return game.i18n.localize("EQUIPMENTSLOTS.MENU.title");
  }


  async _prepareContext(options = {}) {
    const hideDefault = game.settings.get(MODULE.id, MODULE.setting.fulldisable);
    let context = {};

    context.categories = [];
    for (const [name, obj] of Object.entries(this.defaultCategories)) {
      context.categories.push({
        name: obj.name ?? name,
        label: game.i18n.localize(obj.label),
        enabled: obj.value,
        module: obj?.module ?? false,
        moduleordefault: obj.default || (obj?.module ?? false),
        hide: obj.default && hideDefault ? "hide" : ""
      });
    }

    const categories = hideDefault ? GetNonDefaultItems(this.defaultCategories) : this.defaultCategories;
    this.CategoryDropdown = context.categoryDropdown = GetCategories(categories, true, true);
    const arProf = CONFIG.DND5E.armorProficiencies;
    delete arProf.shl;
    this.ProfDropdown = context.profDropdown = GetCategories(arProf, false);

    context.items = []
    for (const [name, obj] of Object.entries(this.defaultItems)) {
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

    context = foundry.utils.mergeObject(await super._prepareContext(options), context, { inplace: false });

    return context;
  }

  static async #addButton(event, target) {
  }

  static async #addButtonCategory(event, target) {
    const form = this.element;
    let currentCategories = [];
    if (form) {
      const formData = new foundry.applications.ux.FormDataExtended(form);
      const data = foundry.utils.expandObject(formData.object);
      currentCategories = data.categories ? Object.values(data.categories).filter((c) => c && c.name) : [];
    } else {
      currentCategories = game.settings.get(MODULE.id, MODULE.setting.categories) || [];
    }
    currentCategories.push({ name: foundry.utils.randomID(), label: "New Category", enabled: true, module: false, moduleordefault: false });
    // await game.settings.set(MODULE.id, MODULE.setting.categories, currentCategories); // I would prefer to only run an update on Submit, but probably can change to real time too? 
    this.render();
  }

  static #deleteButton(event, target) {
    // $(target).parent().remove();
  }

  static async #onSubmit(event, form, formData) {
    let output = formData;

    console.debug(form, formData);
    // foundry.applications.settings.SettingsConfig.reloadConfirm({ world: true });
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

    return foundry.applications.settings.SettingsConfig.reloadConfirm({ world: true });
  }
}