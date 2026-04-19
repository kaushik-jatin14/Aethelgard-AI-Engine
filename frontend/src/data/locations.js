// 25 Ancient Lore Locations
// landscapeUrl: Full Unsplash landscape for FPP environment viewer
// imageThumb: Smaller preview for map hover cards

export const locations = [
  {
    id: 'l1', name: 'The Nexus Point', x: 50, y: 55,
    imageThumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=90',
    terrain: 'Ancient rune-carved stone plaza',
    threats: ['Rune Wraiths', 'Dimensional Rifts'],
    population: 'Scattered Scholars and Wanderers',
    atmosphere: 'mystical',
    lore: 'The origin point of all creation. Ancient runes pulse with energy beneath the cracked earth. Dimensional walls are thin here — monsters from other realms seep through the rifts.',
    currentEvent: 'A dimensional rift opened at dawn. Something enormous came through.'
  },
  {
    id: 'l2', name: 'Canyon of Whispers', x: 30, y: 40,
    imageThumb: 'https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=1600&q=90',
    terrain: 'Deep crimson ravine carved by ancient rivers of blood',
    threats: ['Soul Eaters', 'Echo Phantoms', 'Wind Stalkers'],
    population: 'Ghostly apparitions of the fallen',
    atmosphere: 'scary',
    lore: 'Ten thousand warriors fell here in the Last Crusade. Their screams still echo in the canyon walls. The wind speaks names of the dead.',
    currentEvent: 'A war-band of Echo Phantoms is moving north toward the Ruins of Oakhaven.'
  },
  {
    id: 'l3', name: 'Ruins of Oakhaven', x: 55, y: 25,
    imageThumb: 'https://images.unsplash.com/photo-1604168612704-edf71242a25a?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=90',
    terrain: 'Collapsed city with crumbling stone spires',
    threats: ['Corrupt Guards', 'Council Assassins', 'Thieves'],
    population: 'Underground resistance cells, corrupt council soldiers',
    atmosphere: 'dark',
    lore: "Once the greatest city of the realm, Oakhaven was shattered when the ruling council betrayed the people. The Guild Sigil is rumored to be hidden in the Council's old vaults.",
    currentEvent: 'The council has deployed a new platoon of iron-masked soldiers in the ruins.'
  },
  {
    id: 'l4', name: 'The Ashen Wastes', x: 45, y: 35,
    imageThumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=90',
    terrain: 'Volcanic grey ash fields with bone-like dead trees',
    threats: ['Ash Golems', 'Plague Carriers', 'Rot Hounds'],
    population: 'None — completely abandoned',
    atmosphere: 'desolate',
    lore: 'Where the Great Plague began centuries ago. The ground is covered in permanent grey ash. Nothing grows. Nothing lives.',
    currentEvent: 'A survivor claiming to be a plague doctor has lit a signal fire. His motives are unknown.'
  },
  {
    id: 'l5', name: 'Crystal Caves', x: 75, y: 65,
    imageThumb: 'https://images.unsplash.com/photo-1515263487926-c22e4c2f82ba?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1600&q=90',
    terrain: 'Glowing crystal-filled underground caverns',
    threats: ['Crystal Golems', 'Cave Serpents', 'Void Shards'],
    population: 'Exiled mages and crystal miners',
    atmosphere: 'mystical',
    lore: 'The crystals here store ancient memory. Touch one and you see flashes of the past. The Aethel Crystal fragments emit a constant resonant hum.',
    currentEvent: 'A void rift opened deep in the eastern tunnels. Crystal Golems are emerging from it.'
  },
  {
    id: 'l6', name: 'The Crimson Peak', x: 55, y: 45,
    imageThumb: 'https://images.unsplash.com/photo-1606117331085-5760e3b58520?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1606117331085-5760e3b58520?w=1600&q=90',
    terrain: 'Iron-red mountains stained by ancient warfare',
    threats: ['Mountain Wraiths', 'Siege Golems', 'Blood Harpies'],
    population: 'Ancient soldiers, their minds trapped in a battle long over',
    atmosphere: 'scary',
    lore: "The peak is named for the rivers of blood that flowed down its face during the War of Gods. The peak contains a vault holding the last God-King's crown.",
    currentEvent: 'Blood Harpies have taken the summit. They are building nests over the vault entrance.'
  },
  {
    id: 'l7', name: 'Silent Marsh', x: 80, y: 80,
    imageThumb: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1600&q=90',
    terrain: 'Dense poisonous swamp with black water and fog',
    threats: ['Bog Lurkers', 'Poison Wraiths', 'Swamp Dragons'],
    population: 'A tribe of plague-immune Marsh Folk',
    atmosphere: 'scary',
    lore: 'The water here is pitch black and every bubbling sound you hear is something moving under the surface. Swamp Dragons nest in the deeper areas.',
    currentEvent: 'A Swamp Dragon has eaten the Marsh Folk elder. The tribe is in chaos.'
  },
  {
    id: 'l8', name: 'The Obsidian Citadel', x: 15, y: 90,
    imageThumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=90',
    terrain: 'Massive black glass fortress on a cliff edge',
    threats: ['Iron Sentinels', 'Shadow Priests', 'The Dark King'],
    population: 'Army of the Dark King: 10,000 soldiers',
    atmosphere: 'intimidating',
    lore: "The seat of the Dark King, Malachar. The citadel is carved from a single black crystal and absorbs all light around it. No army has ever breached its walls.",
    currentEvent: 'The Dark King has mobilized his army. They march in 3 days.'
  },
  {
    id: 'l9', name: 'Forgotten Grove', x: 85, y: 20,
    imageThumb: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=90',
    terrain: 'Glowing ancient forest with silver-leafed trees',
    threats: ['Corrupted Treants', 'Blight Sprites'],
    population: "Lyra's order of forest monks, rare magical creatures",
    atmosphere: 'soothing',
    lore: "One of the last truly magical places in the realm. Silver-leafed ancient trees glow softly at night. But the Blight is slowly reaching the grove's edges.",
    currentEvent: 'The World Tree sapling has started to wither. The monks perform a desperate ritual.'
  },
  {
    id: 'l10', name: 'The Iron Bridge', x: 65, y: 15,
    imageThumb: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=90',
    terrain: 'A massive rusted iron bridge over an infinite chasm',
    threats: ['Bridge Trolls', 'Chain Wraiths', 'The Toll-Master'],
    population: 'Heavily armed mercenary toll collectors',
    atmosphere: 'tense',
    lore: 'The only crossing between the eastern and western realms. The Toll-Master demands a price for crossing that is never gold.',
    currentEvent: 'The Toll-Master has sealed the bridge until someone delivers him a fresh soul.'
  },
  {
    id: 'l11', name: 'Valley of Bones', x: 35, y: 85,
    imageThumb: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=90',
    terrain: 'A vast valley shaped by the skeleton of a colossal ancient beast',
    threats: ['Bone Constructs', 'Revenant Kings', 'Grave Wyrms'],
    population: "Malakor's army of the undead",
    atmosphere: 'scary',
    lore: "The skeleton of the God-Beast Vorkan forms the mountains and cliffs of this valley. Malakor raises his undead army here. Revenant Kings command battalions.",
    currentEvent: 'Malakor has risen a new Revenant King from a recently discovered royal tomb.'
  },
  {
    id: 'l12', name: 'The Weeping Falls', x: 65, y: 85,
    imageThumb: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1600&q=90',
    terrain: 'Upward-flowing waterfalls of silver liquid, not water',
    threats: ['Gravity Anomalies', 'Siren Spirits', 'Time Fragments'],
    population: 'A monastery of monks studying the anomaly',
    atmosphere: 'mystical',
    lore: "The liquid flowing upward is pure condensed magic. If drunk, it briefly gives one the ability to see all possible futures. The Siren Spirits lure travelers off the cliffs.",
    currentEvent: 'Three monks have vanished after drinking an unusually large amount of the silver liquid.'
  },
  {
    id: 'l13', name: 'Temple of the Void', x: 85, y: 70,
    imageThumb: 'https://images.unsplash.com/photo-1520034475321-cbe63696469a?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1520034475321-cbe63696469a?w=1600&q=90',
    terrain: 'A structure that absorbs light; total darkness within',
    threats: ['Void Creatures', 'Sanity Erosion', 'The Void Itself'],
    population: 'Void cultists who have gone mad',
    atmosphere: 'terrifying',
    lore: 'Not built — it appeared overnight 500 years ago. The interior is absolute darkness. Those who enter without a light-ward go mad within minutes.',
    currentEvent: 'The temple has started expanding. Three nearby villages have been consumed.'
  },
  {
    id: 'l14', name: 'The Shimmering Sands', x: 25, y: 65,
    imageThumb: 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?w=1600&q=90',
    terrain: 'Vast desert of crystalline sand that refracts light into rainbows',
    threats: ['Sand Elementals', 'Glass Scorpions', 'Desert Wraiths'],
    population: 'Nomadic trading caravans',
    atmosphere: 'adventurous',
    lore: 'The sand here is actually powdered crystal. Walking on it creates a haunting musical sound. The Glass Scorpions camouflage perfectly in the sand.',
    currentEvent: 'A caravan carrying a map to the Final Gate has gone missing in the sands.'
  },
  {
    id: 'l15', name: 'Gloomwood Forest', x: 35, y: 25,
    imageThumb: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1600&q=90',
    terrain: 'Ancient black-barked trees so dense the sky is invisible',
    threats: ['Shadow Wolves', 'Gloom Stalkers', 'The Lurking Horror'],
    population: 'Isolated communities who never leave',
    atmosphere: 'dark',
    lore: 'In Gloomwood, it is always twilight. The Lurking Horror is a creature of unknown origin that hunts exclusively by sound.',
    currentEvent: 'The Lurking Horror attacked a village last night. 40 are missing.'
  },
  {
    id: 'l16', name: 'The Howling Abyss', x: 10, y: 45,
    imageThumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=90',
    terrain: 'Massive meteor-impact crater emitting a constant terrifying wail',
    threats: ['Abyss Crawlers', 'Sound Wraiths', 'The Wailing God'],
    population: 'Deaf hunters who discovered immunity',
    atmosphere: 'terrifying',
    lore: 'When the meteor struck, it opened a fissure to some dark dimension. The wailing sound is actually the language of the creature trapped below.',
    currentEvent: 'The wailing has changed pitch. Something is responding to it from below.'
  },
  {
    id: 'l17', name: 'Sanctuary of Light', x: 80, y: 10,
    imageThumb: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=90',
    terrain: 'A vast plateau bathed in permanent golden light',
    threats: ['Fallen Paladins (corrupted)', 'Light Hunters from the Dark King'],
    population: '5,000 refugees, the last order of Holy Knights',
    atmosphere: 'soothing',
    lore: 'The only truly safe place in Aethelgard. A magical barrier maintained by the Holy Knights repels all darkness.',
    currentEvent: "The barrier is weakening. Sir Galahad is among those reinforcing it — at great personal cost."
  },
  {
    id: 'l18', name: 'The Molten Core', x: 60, y: 45,
    imageThumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1533905133673-ce4f53f4d8b9?w=1600&q=90',
    terrain: 'Active volcanic network with rivers of lava and obsidian spires',
    threats: ['Lava Elementals', 'Fire Drakes', 'The Magma King'],
    population: 'A clan of Fire-Forged dwarves',
    atmosphere: 'adventurous',
    lore: 'Beneath the Molten Core lies the forge where the Gods originally created the realm. The Magma King — an ancient elemental — claims dominion over all volcanic territory.',
    currentEvent: 'The Magma King has demanded tribute in living flesh. The dwarves are preparing for war.'
  },
  {
    id: 'l19', name: 'Frozen Tundra', x: 50, y: 10,
    imageThumb: 'https://images.unsplash.com/photo-1488591216974-3e1e5b78af63?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1488591216974-3e1e5b78af63?w=1600&q=90',
    terrain: 'Endless permafrost plains with howling blizzards',
    threats: ['Frost Giants', 'Dire Wolves', 'Blizzard Wraiths'],
    population: "Kael's tundra wolf-packs and scattered frost tribes",
    atmosphere: 'adventurous',
    lore: 'Where Kael grew up, abandoned and alone. The Frost Giants view the tundra as theirs. The mythical World Tree is rumored to be hidden somewhere in the deepest tundra.',
    currentEvent: 'A Frost Giant warchief has united three tribes and is marching on the largest settlement.'
  },
  {
    id: 'l20', name: 'The Whispering Woods', x: 30, y: 55,
    imageThumb: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=90',
    terrain: 'Ancient forest where every tree contains a sealed memory',
    threats: ['Memory Phantoms', 'Cursed Travelers', 'The Archivist'],
    population: 'Memory Keepers — an ancient order',
    atmosphere: 'mystical',
    lore: 'The trees here are living archives. Touching their bark plays a memory. The Archivist guards one particular tree that holds the memory of how to destroy the Void.',
    currentEvent: 'The Archivist has gone mad after touching a corrupted memory. The tree must be found.'
  },
  {
    id: 'l21', name: "Dragon's Roost", x: 85, y: 85,
    imageThumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=90',
    terrain: 'Sky-high volcanic peaks where ancient dragons nested',
    threats: ['Ancient Dragons', 'Rival Valkyries', 'Storm Beasts'],
    population: "Freya's storm-clan and a handful of dragon-tamers",
    atmosphere: 'adventurous',
    lore: "The highest peaks in Aethelgard, always wreathed in storm clouds. Three Ancient Dragons still nest here — the last of their kind.",
    currentEvent: 'A mechanical scouting unit has been spotted approaching the lowest peak. Freya is furious.'
  },
  {
    id: 'l22', name: 'The Sunken City', x: 20, y: 20,
    imageThumb: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1600&q=90',
    terrain: 'Ancient ruins half-submerged in a dark magical lake',
    threats: ['Drowned Kings', 'Deep Leviathans', 'Cursed Water'],
    population: 'None — all drowned long ago, but their spirits remain',
    atmosphere: 'mystical',
    lore: "A civilization that angered the sea goddess was swallowed in a single night. The Tears of the Sunken City can cleanse any curse or blight.",
    currentEvent: 'A Deep Leviathan has surfaced. It carries on its back the tomb of the last Sunken King.'
  },
  {
    id: 'l23', name: 'The Clockwork Tower', x: 40, y: 20,
    imageThumb: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=1600&q=90',
    terrain: 'A massive brass-and-iron mechanical tower spanning 3,000 feet',
    threats: ['Mechanical Soldiers', 'Clockwork Beasts', 'The Tower Intelligence'],
    population: '100,000 mechanical soldiers, still active',
    atmosphere: 'intimidating',
    lore: "Built by a mad artificer-king who wanted to replace all mortal soldiers with machines. The Tower Intelligence has been running the army on its own for 400 years.",
    currentEvent: 'The Tower Intelligence has activated a new prototype: a mechanical giant capable of destroying city walls in seconds.'
  },
  {
    id: 'l24', name: 'The Blightlands', x: 65, y: 55,
    imageThumb: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1600&q=90',
    terrain: 'A rapidly expanding zone of black decay corrupting all life',
    threats: ['Blight Beasts', 'Rotting Colossus', 'The Source'],
    population: 'Dying survivors clinging to the edges',
    atmosphere: 'scary',
    lore: "The Blight started as a single black flower. Now it covers a thousand square miles. The Tears of the Sunken City are the only cure.",
    currentEvent: 'The Blight has jumped the old river border. It is accelerating.'
  },
  {
    id: 'l25', name: 'The Final Gate', x: 90, y: 90,
    imageThumb: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=500&q=80',
    landscapeUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1600&q=90',
    terrain: 'A colossal floating stone arch between two peaks, surrounded by eternal storm',
    threats: ['The Gate Watchers', 'Reality Distortions', 'Divine Trials'],
    population: 'The Gate Watchers — ancient immortal guardians',
    atmosphere: 'adventurous',
    lore: "The Final Gate leads to the realm of the gods. The Gate Watchers will only open it for someone who has completed all divine trials scattered across Aethelgard.",
    currentEvent: 'For the first time in 500 years, the Gate has cracked open slightly. Something is trying to come through from the other side.'
  }
];
