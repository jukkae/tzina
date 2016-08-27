import Chapters from './chapters'
import Characters from './characters'
import Character from './character'
import DebugUtil from './util/debug'

import _ from 'lodash'

export default class CharacterController {
    constructor(config, animations, square, collisionManager)  {
        this.config = config;
        this.collisionManager = collisionManager;
        this.characters = {};
        this.square = square;
        this.activeCharacters = [];
        this.animations = animations;
    }
    init(loadingManager) {
        console.log("Initializing Character controller");
        Characters.forEach((characterProps) => {
            let character = new Character(characterProps, this.collisionManager);
            character.animation = this.animations[characterProps.animation];
            character.init(loadingManager);
            this.characters[characterProps.name] = character;
        });
        events.on("hour_updated", (hour) => {
            console.log("Loading characters for ", hour);
            
            let chapter = _.find(Chapters, {hour});
            chapter.characters.forEach((characterName) => {
                if (this.characters[characterName]) {
                    this.activeCharacters.push(this.characters[characterName]);
                }
            });

            this.activeCharacters.forEach((character) => {
                this.square.mesh.add(character);
                character.load();
                character.play();
                DebugUtil.positionObject(character, character.props.name, character.props.rotation);
            });

        });
    }

    update(dt,et) {
        for (let i = 0; i < this.activeCharacters.length; i++) {
            this.activeCharacters[i].update(dt,et);
        }
    }
}
