# Deyzeria's Equipment Slots
DnD5e module which adds basic equipment slots on top of the existing 5e armor, which don't provide AC. Adds (For each armor type + clothing)- hats, gloves, legs, boots, as well as accessories- rings, necklaces, face and back slots.

![image](https://github.com/user-attachments/assets/81892de9-ce4f-46ba-b61b-730d06b4126a)

## Module comes with pre-changed SRD items in a separate compendium
This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

The software component of this system is distributed under the MIT license.

## Now allows manual editing
![image](https://github.com/user-attachments/assets/539dab03-96bf-4dac-bc9a-a8e7a8956253)

## Example of using as an API to add extra types/categories
On `init` hook of your module, call with the following schema
```javascript
const foo = {
  bar1: {
    label: "Label 1",
    prof: "lgt", // Supports either flat boolean true (for equipment you are always proficient in) or proficiency types- 'lgt'/'med'/'hvy'
    category: "newcategory" // Either use one of the existing category id's- helmet, pants, gloves, boots, extraslots or add extra ones as will be described afterwards
  },
  bar2: {
    label: "Label 2",
    prof: true,
    category: "boots"
  }
}
Deyzeria.SetupArmors(foo);
```

If you want to add an extra category, on `setup` add the new categories to the new config-
```javascript
CONFIG.Deyzeria.ExtraEquipmentSlotsCategories.newcategory = "New Category";
```

## Paper Doll Custom Filters
Initially this module was made under the inspiration of Paper Doll from TheRipper and to work with it. You can(And should!) get the module here - https://foundryvtt.com/packages/fvtt-paper-doll-ui

It allows to set custom filters in slots, and this was the initial inspiration for me making this module.

For the slots which allow several items, these are the premades
```javascript
// Hat-
return ['clothhat', 'lighthat', 'mediumhat', 'heavyhat'].includes(item.system.type.value);
// Gloves-
return ['clothhands', 'lighthands', 'mediumhands', 'heavyhands'].includes(item.system.type.value);
// Pants-
return ['clothpants', 'lightpants', 'mediumpants', 'heavypants'].includes(item.system.type.value);
// Boots-
return ['clothboots', 'lightboots', 'mediumboots', 'heavyboots'].includes(item.system.type.value);

// Any other slot can be simply defined directly-
return item.system.type.value == 'whatever';
// You can see specific ID's in the module setting menu
```
