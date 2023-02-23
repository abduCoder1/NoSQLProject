fetch("http://localhost:3000/teams")
    .then(function(response){
        return response.json();
    })
    .then(function(teams){
        let placeholder = document.querySelector("#teams-output");
        let out = "";
        for(let team of teams) {
            out += `
         <tr>
            <td><img src='${team.logo}' title='${team.name}' id='logo' height="50px" width="50px"></td>
            <td>#${team.ranking}</td>
            <td>${team.name}</td>
           </tr>
       `
        }
placeholder.innerHTML = out;
});