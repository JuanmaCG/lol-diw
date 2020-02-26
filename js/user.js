const riotUrl = "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/";
const ApiKey = "RGAPI-bc60ac66-5742-4f11-8f80-2de8a273d3f6";

function buildUrl(username) {
    return riotUrl + username + "?api_key=" + ApiKey
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function(item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

const vm_user = new Vue({
    el: '#user',
    data: {
        usuario: findGetParameter('summonerName'),
        userInfo: [],
        leagueUserInfo: [],
        userIconId: null,
        iconUrl: null,
        champInfo: [],
        topFiveChamp: [],
        matchesId: [],
        matchesResult: [],
        userMatchInfo: {}
    },
    mounted: function() {
        axios.all([this.getUser(this.usuario), this.getWinsLosses(), this.getTopFiveChamps(), this.getChamps(), this.getMatchId(), this.getMatchesResult()])

    },
    methods: {
        getUser(username) {
            let url = buildUrl(username);
            axios.get(url).then((response) => {
                this.userInfo = response.data;
                this.userIconId = response.data.profileIconId;
                this.iconUrl = "https://ddragon.leagueoflegends.com/cdn/9.22.1/img/profileicon/" + this.userIconId + ".png";


            }).catch(error => { console.log(error); });
        },
        async getWinsLosses() {

            let url = buildUrl(this.usuario);
            const asyncData = await axios.get(url);

            axios.get('https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + asyncData.data.id + '?api_key=' + ApiKey)
                .then((response) => {
                    this.leagueUserInfo = response.data.find(leagueUserInfo => leagueUserInfo.queueType === "RANKED_SOLO_5x5");
                }).catch(error => { console.log(error); });
        },
        async getTopFiveChamps() {
            let url = buildUrl(this.usuario);
            const asyncData = await axios.get(url);

            axios.get('https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/' + asyncData.data.id + '?api_key=' + ApiKey)
                .then((response) => {
                    this.champInfo = response.data;
                    this.champInfo.splice(5, this.champInfo.length)
                })
        },
        async getChamps() {
            let url = buildUrl(this.usuario);
            const userId = await axios.get(url);

            await axios.get('https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/' + userId.data.id + '?api_key=' + ApiKey)

            axios.get('http://ddragon.leagueoflegends.com/cdn/9.22.1/data/en_US/champion.json')
                .then((response) => {
                    let champs = response.data.data;
                    let i = 0;
                    for (champ in champs) {
                        if (champs[champ].key == this.champInfo[i].championId) {
                            this.topFiveChamp.push(champs[champ]);
                            i++;
                        }
                    }



                })
        },

        async getMatchId() {
            let url = buildUrl(this.usuario);
            const userId = await axios.get(url);

            axios.get('https://euw1.api.riotgames.com/lol/match/v4/matchlists/by-account/' + userId.data.accountId + '?endIndex=5&api_key=' + ApiKey)
                .then((response) => {
                    let matches = response.data.matches

                    for (match in matches) {
                        this.matchesId.push(matches[match].gameId)
                    }
                })
        },

        async getMatchesResult() {
            let url = buildUrl(this.usuario);
            const userId = await axios.get(url);
            await axios.get('https://euw1.api.riotgames.com/lol/match/v4/matchlists/by-account/' + userId.data.accountId + '?endIndex=5&api_key=' + ApiKey)

            axios.all([
                    axios.get('https://euw1.api.riotgames.com/lol/match/v4/matches/' + this.matchesId[0] + '?api_key=' + ApiKey),
                    axios.get('https://euw1.api.riotgames.com/lol/match/v4/matches/' + this.matchesId[1] + '?api_key=' + ApiKey),
                    axios.get('https://euw1.api.riotgames.com/lol/match/v4/matches/' + this.matchesId[2] + '?api_key=' + ApiKey),
                    axios.get('https://euw1.api.riotgames.com/lol/match/v4/matches/' + this.matchesId[3] + '?api_key=' + ApiKey),
                    axios.get('https://euw1.api.riotgames.com/lol/match/v4/matches/' + this.matchesId[4] + '?api_key=' + ApiKey)
                ])
                .then(axios.spread((match1, match2, match3, match4, match5) => {
                    // do something with both responses
                    let responses = [match1, match2, match3, match4, match5];
                    for (let i = 0; i < responses.length; i++) {
                        for (let j = 0; j < responses[i].data.participantIdentities.length; j++) {
                            if (responses[i].data.participantIdentities[j].player.summonerName == this.usuario) {
                                this.userMatchInfo = { "participantId": responses[i].data.participantIdentities[j].participantId, "teamId": responses[i].data.participants[j].teamId }
                            }
                        }

                        if (responses[i].data.teams[1].teamId == this.userMatchInfo.teamId || responses[i].data.teams[0].teamId == this.userMatchInfo.teamId) {
                            if (responses[i].data.teams[1].win == "Win") {
                                this.matchesResult.push('Ganado')
                            } else {
                                this.matchesResult.push('Perdido')
                            }
                        }

                    }
                }));

        }
    }

});