export function generatePermutations(Arr){
    let permutations = [];
    let A = Arr.slice();

    function swap(a,b){
        let tmp = A[a];
        A[a] = A[b];
        A[b] = tmp;
    }

    function generate(n, A){
        if (n === 1){
            permutations.push(A.slice());
        } else {
            for(let i = 0; i <= n-1; i++) {
                generate(n-1, A);
                swap(n % 2 === 0 ? i : 0 ,n-1);
            }
        }
    }
    generate(A.length, A);
    return permutations;
}


export function generateCityRoutes(cities){
    let pems = generatePermutations(cities.slice(1));
    for (var i = 0; i < pems.length; i++){
        pems[i].unshift(cities[0]);
        pems[i].push(cities[0]);
    }
    return pems;
}


