const lib = require('lib')({ token: null });

enum GameResult {
    Loss = -1,
    Win = 1
}

interface ProfileStats {
    gamertag: string;
    clantag: string;
    emblem: string;
    playtime: string;
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRatio: number;
    kills: number;
    deaths: number;
    killDeathRatio: number;
    killsPerGame: number;
    deathsPerGame: number;
    last20: Array<GameResult>;
    streak: string;
}

class Profile {
    private stats: ProfileStats;

    private constructor(obj: ProfileStats) {
        this.stats = obj;
    }
    
    static async findProfile(gamertag: string): Promise<Profile> {
        try {
            let result = await lib.halo.mcc['@0.0.11'].stats({
                gamertag: gamertag
            });
            return new Profile(result);
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    get gamertag(): string {
        return this.stats.gamertag;
    }
    get clantag(): string {
        return this.stats.clantag;
    }
    get emblem(): string {
        return this.stats.emblem
    }
    get playtime(): string {
        return this.stats.playtime;
    }
    get gamesPlayed(): number {
        return this.stats.gamesPlayed;
    }
    get wins(): number {
        return this.stats.wins;
    }
    get losses(): number {
        return this.stats.losses;
    }
    get winRatio(): number {
        return this.stats.winRatio;
    }
    get kills(): number {
        return this.stats.kills;
    }
    get deaths(): number {
        return this.stats.deaths;
    }
    get killDeathRatio(): number {
        return this.stats.killDeathRatio;
    }
    get killsPerGame(): number {
        return this.stats.killsPerGame;
    }
    get deathsPerGame(): number {
        return this.stats.deathsPerGame;
    }
    get last20Games(): Array<GameResult> {
        return this.stats.last20;
    }
    get streak(): string {
        return this.stats.streak;
    }
}

(async () => {
    try {
        let profile = await Profile.findProfile("xXDIRTYBOMBXx");
        console.log(profile);
    } catch (e) {
        
    }
})();