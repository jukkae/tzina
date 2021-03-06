import Chapters from './chapters'
import Characters from './characters'
import Character from './character'
import DebugUtil from './util/debug'

import _ from 'lodash'

export default class CharacterController {
    constructor(config, animations, square, collisionManager, soundManager)  {
        this.config = config;
        this.collisionManager = collisionManager;
        this.soundManager = soundManager;
        this.characters = {};
        this.square = square;
        this.activeCharacters = [];
        this.animations = animations;
        this.addedColliders = false;
    }
    init(loadingManager) {
        console.log("Initializing Character controller");
        Characters.forEach((characterProps) => {
            let character = new Character(this.config, characterProps, this.collisionManager, this.soundManager);
            character.animation = this.animations[characterProps.animation];
            character.init(loadingManager);
            this.characters[characterProps.name] = character;
        });
        events.on("hour_updated", (hour) => {
            
            let clone = this.activeCharacters.slice(0);
            this.activeCharacters = [];

            for (let i = 0; i < clone.length; i++) {
                let character = clone[i];

                if (!character.done) {
                    this.square.mesh.remove(character);
                    character.unload();
                } else {
                    console.log("Character " + character.props.name + " is still active");
                    this.activeCharacters.push(character);
                }
                if (character.addedColliders) {
                    console.log("Removing colliders: " + character.props.name);
                    this.collisionManager.removeCharacter(character);
                    character.addedColliders = false;
                }
            }

            console.log("Loading characters for ", hour);
            
            let chapter = _.find(Chapters, {hour});
            chapter.characters.forEach((characterName) => {
                if (this.characters[characterName] && !this.characters[characterName].done) {
                    let character = this.characters[characterName];
                    this.activeCharacters.push(character);
                    this.square.mesh.add(character);
                    //DebugUtil.positionObject(character, character.props.name, character.props.rotation);
                    character.load();
                    character.play();
                }
            });


        });
        events.on("angle_updated", (hour) => {
            this.activeCharacters.forEach((character) => {
                if (!character.done && !character.addedColliders) {
                    console.log("Adding colliders: " + character.props.name);
                    this.collisionManager.addCharacter(character);
                    character.addedColliders = true;
                }
            });
        });
    }

    update(dt,et) {
        for (let i = 0; i < this.activeCharacters.length; i++) {
            this.activeCharacters[i].update(dt,et);
        }
    }
}
