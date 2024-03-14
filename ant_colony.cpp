#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <random>
#include <cmath>

using namespace std;

// Define parameters for ACO
const int num_ants = 10;
const int num_iterations = 100;
const double pheromone_decay = 0.1;
const double pheromone_constant = 1;
const double evaporation_constant = 0.5;

// Define a function to convert character to ASCII value
int char_to_ascii(char c) {
    return static_cast<int>(c);
}

// Define a function to decrypt ciphertext using RSA decryption
char rsa_decrypt(int ciphertext, int private_key, int public_modulus) {
    int decrypted_value = pow(ciphertext, private_key);
    decrypted_value %= public_modulus;
    return static_cast<char>(decrypted_value);
}

// Define a function to calculate fitness
int fitness(const string& decrypted_text, const string& plaintext) {
    size_t common_length = 0;
    size_t len1 = decrypted_text.length();
    size_t len2 = plaintext.length();
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

int main(int argc, char* argv[]) {
    if (argc != 105) {
        cout << "Usage: " << argv[0] << " <plaintext> <ciphertext> <public_key> <public_modulus> <private_key1> <private_key2> ... <private_key100>" << endl;
        return 1;
    }

    string plaintext = argv[1];
    string ciphertext = argv[2];
    int public_key = stoi(argv[3]);
    int public_modulus = stoi(argv[4]);
    vector<int> private_keys;
    for (int i = 5; i < 105; ++i) {
        private_keys.push_back(stoi(argv[i]));
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
            string decrypted_text;
            for (int key : ant_keys[ant_idx]) {
                for (char c : ciphertext) {
                    int ascii_value = char_to_ascii(c);
                    char decrypted_char = rsa_decrypt(ascii_value, key, public_modulus);
                    decrypted_text += decrypted_char;
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
        for (auto& key_pheromone : pheromones) {
            key_pheromone.second *= (1 - evaporation_constant);
        }

        // Decay pheromone levels
        for (auto& key_pheromone : pheromones) {
            key_pheromone.second *= (1 - pheromone_decay);
        }
    }

    // Find the ant with the highest fitness
    int best_key = -1;
    double best_fitness = 0;
    for (auto& key_pheromone : pheromones) {
        if (key_pheromone.second > best_fitness) {
            best_fitness = key_pheromone.second;
            best_key = key_pheromone.first;
        }
    }

    cout << best_key << endl;
    return 0;
}