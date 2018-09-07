export class Player {
    name: string;
    score: number;

    static deserialize(json: any): Player {
        return new Player(json.name, json.score);
    }

    constructor(name: string, score: number = 0) {
        this.name = name;
        this.score = score;
    }
}
