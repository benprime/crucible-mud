import { Seeder } from 'mongoose-data-seed';
import Room from '../src/models/room';
import { Types } from 'mongoose';

const data = [
  {
    "_id": Types.ObjectId("5b74b9a762976d41dae0c285"),
    "name": "Cursed Gateway",
    "desc": "The door to the south flickers with energy.",
    "alias": null,
    "x": 0,
    "y": -1,
    "z": 0,
    "__v": 0,
    "area": "5b74b9ca62976d41dae0c288",
    "inventory": [],
    "exits": [
        {
            "dir": "n",
            "roomId": "5b74b95c7bf1c641880250fe",
            "_id": Types.ObjectId("5b74b9a762976d41dae0c286")
        },
        {
            "_id": Types.ObjectId("5b74ba0062976d41dae0c28b"),
            "roomId": "5b74ba0062976d41dae0c289",
            "dir": "s",
            "closed": false
        }
    ]
},
{
    "_id": Types.ObjectId("5b74ba0062976d41dae0c289"),
    "name": "Entryway",
    "desc": "This room seems to give off its own heat, and the breeze from the south carries floating cinders.",
    "alias": null,
    "x": 0,
    "y": -2,
    "z": 0,
    "__v": 0,
    "area": "5b74b9ca62976d41dae0c288",
    "inventory": [],
    "exits": [
        {
            "dir": "n",
            "roomId": "5b74b9a762976d41dae0c285",
            "_id": Types.ObjectId("5b74ba0062976d41dae0c28a")
        },
        {
            "_id": Types.ObjectId("5b74bbfc959cbe4520536873"),
            "roomId": "5b74bbfc959cbe4520536871",
            "dir": "e"
        },
        {
            "_id": Types.ObjectId("5b74be6a959cbe4520536876"),
            "roomId": "5b74be6a959cbe4520536874",
            "dir": "s"
        }
    ]
},
{
    "_id": Types.ObjectId("5b74b95c7bf1c641880250fe"),
    "name": "Ye Olde Welcome Room",
    "desc": "Dusty training implements line the walls of this empty chamber.",
    "x": 0,
    "y": 0,
    "z": 0,
    "__v": 1,
    "spawner": {
        "_id": Types.ObjectId("5b74c198ec3b5648a800d6fb"),
        "max": 1,
        "timeout": 5000,
        "mobTypes": [
            "dummy"
        ]
    },
    "inventory": [],
    "exits": [
        {
            "_id": Types.ObjectId("5b74b9a762976d41dae0c287"),
            "roomId": "5b74b9a762976d41dae0c285",
            "dir": "s"
        },
        {
            "_id": Types.ObjectId("5b779e2471dfb628458e4d2d"),
            "roomId": "5b779e2471dfb628458e4d2b",
            "dir": "e"
        }
    ]
},
{
    "_id": Types.ObjectId("5b74bbfc959cbe4520536871"),
    "area": "5b74b9ca62976d41dae0c288",
    "name": "Dead End",
    "desc": "An empty cave with scratches on the walls.",
    "x": 1,
    "y": -2,
    "z": 0,
    "__v": 0,
    "inventory": [],
    "exits": [
        {
            "dir": "w",
            "roomId": "5b74ba0062976d41dae0c289",
            "_id": Types.ObjectId("5b74bbfc959cbe4520536872")
        }
    ]
},
{
    "_id": Types.ObjectId("5b74be6a959cbe4520536874"),
    "area": "5b74b9ca62976d41dae0c288",
    "name": "Passage",
    "desc": "Screams are carried on the air from the south.",
    "x": 0,
    "y": -3,
    "z": 0,
    "__v": 0,
    "inventory": [],
    "exits": [
        {
            "dir": "n",
            "roomId": "5b74ba0062976d41dae0c289",
            "_id": Types.ObjectId("5b74be6a959cbe4520536875")
        },
        {
            "_id": Types.ObjectId("5b74beab959cbe4520536879"),
            "roomId": "5b74beab959cbe4520536877",
            "dir": "s"
        }
    ]
},
{
    "_id": Types.ObjectId("5b74bed4959cbe452053687a"),
    "area": "5b74b9ca62976d41dae0c288",
    "name": "Summoning Pit",
    "desc": "Unholy drawings and splattered blood cover the floor.",
    "x": 0,
    "y": -4,
    "z": -1,
    "__v": 0,
    "spawner": {
        "_id": Types.ObjectId("5b74c0b1ec3b5648a800d6f3"),
        "max": 2,
        "timeout": 30000,
        "mobTypes": [
            "hellhound"
        ]
    },
    "inventory": [],
    "exits": [
        {
            "dir": "u",
            "roomId": "5b74beab959cbe4520536877",
            "_id": Types.ObjectId("5b74bed4959cbe452053687b")
        }
    ]
},
{
    "_id": Types.ObjectId("5b74beab959cbe4520536877"),
    "area": "5b74b9ca62976d41dae0c288",
    "name": "Dark Altar",
    "desc": "An altar and pews are arranged around a staircase leading below.",
    "x": 0,
    "y": -4,
    "z": 0,
    "__v": 0,
    "spawner": {
        "_id": Types.ObjectId("5b74c112ec3b5648a800d6f6"),
        "max": 3,
        "timeout": 20000,
        "mobTypes": [
            "cultist"
        ]
    },
    "inventory": [],
    "exits": [
        {
            "dir": "n",
            "roomId": "5b74be6a959cbe4520536874",
            "_id": Types.ObjectId("5b74beab959cbe4520536878")
        },
        {
            "_id": Types.ObjectId("5b74bed4959cbe452053687c"),
            "roomId": "5b74bed4959cbe452053687a",
            "dir": "d"
        }
    ]
},
{
    "_id": Types.ObjectId("5b779e2471dfb628458e4d2b"),
    "name": "Town Gates",
    "desc": "The gates of Eastmark",
    "x": 1,
    "y": 0,
    "z": 0,
    "inventory": [],
    "exits": [
        {
            "dir": "w",
            "roomId": "5b74b95c7bf1c641880250fe",
            "_id": Types.ObjectId("5b779e2471dfb628458e4d2c")
        },
        {
            "_id": Types.ObjectId("5b779e6971dfb628458e4d35"),
            "roomId": "5b779e6971dfb628458e4d33",
            "dir": "e",
            "closed": true
        }
    ],
    "__v": 1
},
{
    "_id": Types.ObjectId("5b779e6971dfb628458e4d33"),
    "name": "Merchant Street, west end",
    "desc": "A muddy road.",
    "x": 2,
    "y": 0,
    "z": 0,
    "inventory": [],
    "exits": [
        {
            "dir": "w",
            "roomId": "5b779e2471dfb628458e4d2b",
            "_id": Types.ObjectId("5b779e6971dfb628458e4d34")
        },
        {
            "_id": Types.ObjectId("5b779f15f25fe128bd016f66"),
            "roomId": "5b779f15f25fe128bd016f64",
            "dir": "e"
        },
        {
            "_id": Types.ObjectId("5b779fd3f25fe128bd016f72"),
            "roomId": "5b779fd3f25fe128bd016f70",
            "dir": "s"
        }
    ],
    "__v": 2,
    "area": "5b779e8971dfb628458e4d36"
},
{
    "_id": Types.ObjectId("5b779f15f25fe128bd016f64"),
    "area": "5b779e8971dfb628458e4d36",
    "name": "Merchant Street",
    "desc": "A muddy road.",
    "x": 3,
    "y": 0,
    "z": 0,
    "inventory": [],
    "exits": [
        {
            "dir": "w",
            "roomId": "5b779e6971dfb628458e4d33",
            "_id": Types.ObjectId("5b779f15f25fe128bd016f65")
        },
        {
            "_id": Types.ObjectId("5b779f4af25fe128bd016f69"),
            "roomId": "5b779f4af25fe128bd016f67",
            "dir": "e"
        }
    ],
    "__v": 1
},
{
    "_id": Types.ObjectId("5b779f4af25fe128bd016f67"),
    "area": "5b779e8971dfb628458e4d36",
    "name": "Town Square",
    "desc": "The center of town.",
    "x": 4,
    "y": 0,
    "z": 0,
    "inventory": [],
    "exits": [
        {
            "dir": "w",
            "roomId": "5b779f15f25fe128bd016f64",
            "_id": Types.ObjectId("5b779f4af25fe128bd016f68")
        },
        {
            "_id": Types.ObjectId("5b779f58f25fe128bd016f6c"),
            "roomId": "5b779f58f25fe128bd016f6a",
            "dir": "e"
        }
    ],
    "__v": 1
},
{
    "_id": Types.ObjectId("5b779f58f25fe128bd016f6a"),
    "area": "5b779e8971dfb628458e4d36",
    "name": "Merchant Street, east end",
    "desc": "A muddy road.",
    "x": 5,
    "y": 0,
    "z": 0,
    "inventory": [],
    "exits": [
        {
            "dir": "w",
            "roomId": "5b779f4af25fe128bd016f67",
            "_id": Types.ObjectId("5b779f58f25fe128bd016f6b")
        },
        {
            "_id": Types.ObjectId("5b779f69f25fe128bd016f6f"),
            "roomId": "5b779f69f25fe128bd016f6d",
            "dir": "e"
        }
    ],
    "__v": 1
},
{
    "_id": Types.ObjectId("5b779f69f25fe128bd016f6d"),
    "area": "5b779e8971dfb628458e4d36",
    "name": "Default Room Name",
    "desc": "Room Description",
    "x": 6,
    "y": 0,
    "z": 0,
    "inventory": [],
    "exits": [
        {
            "dir": "w",
            "roomId": "5b779f58f25fe128bd016f6a",
            "_id": Types.ObjectId("5b779f69f25fe128bd016f6e")
        }
    ],
    "__v": 0
},
{
    "_id": Types.ObjectId("5b779fd3f25fe128bd016f70"),
    "area": "5b779e8971dfb628458e4d36",
    "name": "General Store",
    "desc": "The general store is lined with goods.",
    "x": 2,
    "y": -1,
    "z": 0,
    "inventory": [],
    "exits": [
        {
            "dir": "n",
            "roomId": "5b779e6971dfb628458e4d33",
            "_id": Types.ObjectId("5b779fd3f25fe128bd016f71")
        }
    ],
    "__v": 0
}];

class RoomsSeeder extends Seeder {

  async shouldRun() {
    return Room.count().exec().then(count => count === 0);
  }

  async run() {
    return Room.create(data);
  }
}

export default RoomsSeeder;
