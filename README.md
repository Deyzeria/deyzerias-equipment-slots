# deyzerias-equipment-slots
DnD5e module which adds basic equipment slots on top of the existing 5e armor, which don't provide AC. Adds (For each armor type + clothing)- hats, gloves, legs, boots, as well as accessories- rings, necklaces, face and back slots.
![image](https://github.com/user-attachments/assets/81892de9-ce4f-46ba-b61b-730d06b4126a)

## Now allows manual editing
![image](https://github.com/user-attachments/assets/539dab03-96bf-4dac-bc9a-a8e7a8956253)

## Example of using as an API to add extra types/categories
On `init` hook of your module, call with the following schema
```javascript
const foo = {
  bar1: {
    label: "Label 1",
    prof: "lgt", // Supports either flat boolean true (for equipment you are always proficient in) or proficiency types- 'lgt'/'med'/'hvy'
    category: "newcategory" // Either use one of the existing category id's- helmet, pants, gloves, bootes, extraslots or add extra ones as will be described afterwards
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
