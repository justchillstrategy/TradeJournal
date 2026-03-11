from utils import calculate_avg_rr

def test_mandatory_logic_gate():
    # Database Input: {Win: 2.0}, {Loss: -1.0}, {Win: 4.0}, {BE: 0.0}, {Draft: 5.0}
    test_trades = [
        {"status": "final", "result": "Win", "r_multiple": 2.0},
        {"status": "final", "result": "Loss", "r_multiple": -1.0},
        {"status": "final", "result": "Win", "r_multiple": 4.0},
        {"status": "final", "result": "Breakeven", "r_multiple": 0.0},
        {"status": "draft", "result": "Win", "r_multiple": 5.0} # Draft must be ignored even if result is Win
    ]
    
    result = calculate_avg_rr(test_trades)
    expected = 3.0
    
    print(f"Backend Test Case Result: {result}")
    
    if result == expected:
        print("SUCCESS: Mandatory Logic Gate Passed (Output is 3.0)")
    else:
        print(f"FAILURE: Expected {expected}, got {result}")
        exit(1)

if __name__ == "__main__":
    test_mandatory_logic_gate()
