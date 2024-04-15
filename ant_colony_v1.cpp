#include <cmath>
#include <iostream>
#include <random>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

using namespace std;

// Define parameters for ACO
const int num_ants = 10;
const int num_iterations = 100;
const double pheromone_decay = 0.1;
const double pheromone_constant = 1;
const double evaporation_constant = 0.5;

// Define a function to decrypt cipher codes using RSA decryption
int rsa_decrypt(int ciphertext, int private_key, int public_modulus) {
    int decrypted_value = pow(ciphertext, private_key);
    decrypted_value %= public_modulus;
    return decrypted_value;
}

// Define a function to calculate fitness
int fitness(const vector<int> &decrypted_text, const vector<int> &plaintext) {
    size_t common_length = 0;
    size_t len1 = decrypted_text.size();
    size_t len2 = plaintext.size();
    for (size_t i = 0; i < len1; ++i) {
        for (size_t j = 0; j < len2; ++j) {
            size_t k = 0;
            while (i + k < len1 && j + k < len2 && decrypted_text[i + k] == plaintext[j + k]) {
                ++k;
            }
            if (k > common_length) {
                common_length = k;
            }
        }
    }
    return common_length;
}

int main(int argc, char *argv[]) {
    int plaintext_length = stoi(argv[1]);
    vector<int> plaintext;
    for (int i = 0; i < plaintext_length; ++i) {
        plaintext.push_back(stoi(argv[i + 2]));
    }

    int cipher_length = stoi(argv[plaintext_length + 2]);
    vector<int> ciphertext;
    for (int i = 0; i < cipher_length; ++i) {
        ciphertext.push_back(stoi(argv[plaintext_length + i + 3]));
    }

    int public_key = stoi(argv[plaintext_length + cipher_length + 3]);
    int public_modulus = stoi(argv[plaintext_length + cipher_length + 4]);

    int private_key_length = stoi(argv[plaintext_length + cipher_length + 5]);
    vector<int> private_keys;
    for (int i = 0; i < private_key_length; ++i) {
        private_keys.push_back(stoi(argv[plaintext_length + cipher_length + i + 6]));
    }

    // Initialize pheromone levels
    unordered_map<int, double> pheromones;
    for (int key : private_keys) {
        pheromones[key] = 1.0;
    }

    // Ant Colony Optimization
    for (int iteration = 0; iteration < num_iterations; ++iteration) {
        vector<unordered_set<int>> ant_keys(num_ants);

        // Ants choose keys based on pheromone levels
        for (int ant_idx = 0; ant_idx < num_ants; ++ant_idx) {
            for (int _ = 0; _ < private_keys.size(); ++_) {
                vector<int> available_keys;
                for (int key : private_keys) {
                    if (!ant_keys[ant_idx].count(key)) {
                        available_keys.push_back(key);
                    }
                }

                vector<double> probabilities;
                double total_pheromone = 0;
                for (int key : available_keys) {
                    total_pheromone += pheromones[key];
                }
                for (int key : available_keys) {
                    probabilities.push_back(pheromones[key] / total_pheromone);
                }

                random_device rd;
                mt19937 gen(rd());
                discrete_distribution<> distribution(probabilities.begin(), probabilities.end());
                int chosen_idx = distribution(gen);
                if (chosen_idx >= 0 && chosen_idx < available_keys.size()) {
                    int chosen_key = available_keys[chosen_idx];
                    ant_keys[ant_idx].insert(chosen_key);
                }
            }
        }

        // Evaluate fitness and update pheromone levels
        for (int ant_idx = 0; ant_idx < num_ants; ++ant_idx) {
            int best_fitness = 0;
            int best_key = -1;
            vector<int>decrypted_text;
            for (int key : ant_keys[ant_idx]) {
                for (int cipher_code : ciphertext) {
                    int decrypted_char = rsa_decrypt(cipher_code, key, public_modulus);
                    decrypted_text.push_back(decrypted_char);
                }
                int ant_fitness = fitness(decrypted_text, plaintext);
                pheromones[key] += pheromone_constant * ant_fitness;
                if (ant_fitness > best_fitness) {
                    best_fitness = ant_fitness;
                    best_key = key;
                }
            }
        }

        // Evaporate pheromone levels
        for (auto &key_pheromone : pheromones) {
            key_pheromone.second *= (1 - evaporation_constant);
        }

        // Decay pheromone levels
        for (auto &key_pheromone : pheromones) {
            key_pheromone.second *= (1 - pheromone_decay);
        }
    }

    // Find the ant with the highest fitness
    int best_key = -1;
    double best_fitness = 0;
    for (auto &key_pheromone : pheromones) {
        if (key_pheromone.second > best_fitness) {
            best_fitness = key_pheromone.second;
            best_key = key_pheromone.first;
        }
    }

    cout << best_key << endl;
}
