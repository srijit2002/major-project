#include <bits/stdc++.h>
using namespace std;

const int N = 1e3;
vector<int> primes;
int public_key;
int private_key;
int n;

void primefiller() {
    vector<bool> sieve(N, true);
    sieve[0] = false;
    sieve[1] = false;
    for (int i = 2; i < N; i++) {
        for (int j = i * 2; j < N; j += i) {
            sieve[j] = false;
        }
    }
    for (int i = 0; i < sieve.size(); i++) {
        if (sieve[i]) {
            primes.emplace_back(i);
        }
    }
}

pair<int, int> pick_random_prime_pair() {
    int i1 = rand() % primes.size();
    int i2 = rand() % primes.size();
    while (i2 == i1) {
        i2 = rand() % primes.size();
    }
    return {primes[i1], primes[i2]};
}

tuple<int, int, int> get_rsa() {
    pair<int, int> prime_pair = pick_random_prime_pair();
    int prime1 = prime_pair.first;
    int prime2 = prime_pair.second;

    n = prime1 * prime2;
    int fi = (prime1 - 1) * (prime2 - 1);
    int e = 2;
    while (1) {
        if (__gcd(e, fi) == 1)
            break;
        e++;
    }
    int d = 2;
    while (1) {
        if ((d * e) % fi == 1)
            break;
        d++;
    }
    return make_tuple(n, e, d);
}

int main() {
    primefiller();
    freopen("../test_set.txt", "w", stdout);
    int TEST_SET_SIZE = 1;
    while (TEST_SET_SIZE--) {
        tuple<int, int, int> res = get_rsa();
        cout << get<0>(res) << " " << get<1>(res) << " " << get<2>(res) << endl;
    }
}
