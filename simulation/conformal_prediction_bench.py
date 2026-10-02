#!/usr/bin/env python3
"""
OPTIX Conformal Prediction Bench & FSSAI Standards Triage
Team AEROS | Smart India Hackathon 2026 | Problem Statement 26233

Theoretical Basis:
- Conformal Prediction for Uncertainty Quantification (Angelopoulos & Bates, 2021)
- Validation Protocol: Black et al. (2025) 404 carcass benchmarking
- FSSAI Food Safety & Standards Regulations 2011 (Tables 5A & 5B)
"""

import math
import random

TAU_LOW = 0.35     # Conformal lower threshold
TAU_HIGH = 0.65    # Conformal upper threshold

FSSAI_POULTRY_TVC_LIMIT = 6.0  # log10 CFU/g (Table 5A: 10^6 CFU/g)
FSSAI_GREENS_TVC_LIMIT  = 5.0  # log10 CFU/g (Table 5B: 10^5 CFU/g)

def run_conformal_triage(risk_score, strip_quality_ok=True):
    """
    Three-way uncertainty-aware triage:
    - risk < tau_low                -> PASS
    - risk > tau_high               -> DIVERT
    - tau_low <= risk <= tau_high   -> QUARANTINE (Uncertain, route to lab)
    - !strip_quality_ok             -> QUARANTINE (Hardware fail-safe)
    """
    if not strip_quality_ok:
        return "QUARANTINE", "Calibration strip drift / Hardware anomaly"
        
    if risk_score < TAU_LOW:
        return "PASS", "Normal spectral behavior within baseline tolerance"
    elif risk_score > TAU_HIGH:
        return "DIVERT", "High-confidence contamination-related spectral anomaly"
    else:
        return "QUARANTINE", "Ambiguous weak-signal residual (requires lab confirmation)"

def simulate_validation_cohort(n_samples=404):
    """Simulates 404 carcasses/samples matching Black et al. (2025) study."""
    random.seed(42)
    
    true_log_tvc = [random.uniform(2.5, 7.5) for _ in range(n_samples)]
    
    # Model risk prediction with slight sensor noise
    predicted_risk = []
    for tvc in true_log_tvc:
        raw = 1.0 / (1.0 + math.exp(-1.8 * (tvc - 5.5))) + random.gauss(0, 0.05)
        clamped = max(0.0, min(1.0, raw))
        predicted_risk.append(clamped)
    
    decisions = []
    quarantine_count = 0
    divert_count = 0
    pass_count = 0
    false_negatives = 0  # Passed items that actually exceeded FSSAI limit
    
    for i in range(n_samples):
        # 2% simulated calibration strip quality issues
        strip_ok = random.random() > 0.02
        decision, reason = run_conformal_triage(predicted_risk[i], strip_ok)
        decisions.append(decision)
        
        if decision == "PASS":
            pass_count += 1
            if true_log_tvc[i] > FSSAI_POULTRY_TVC_LIMIT:
                false_negatives += 1
        elif decision == "DIVERT":
            divert_count += 1
        else:
            quarantine_count += 1

    # Statistical Evaluation
    fnr = false_negatives / max(1, pass_count)
    
    pred_vals = [r * 5.0 + 2.5 for r in predicted_risk]
    sq_errs = [(t - p) ** 2 for t, p in zip(true_log_tvc, pred_vals)]
    rmse = math.sqrt(sum(sq_errs) / n_samples)
    
    mean_true = sum(true_log_tvc) / n_samples
    tot_variance = sum((t - mean_true) ** 2 for t in true_log_tvc)
    r2 = 1.0 - (sum(sq_errs) / max(tot_variance, 1e-9))
    
    return {
        "total_samples": n_samples,
        "pass_count": pass_count,
        "divert_count": divert_count,
        "quarantine_count": quarantine_count,
        "false_negatives": false_negatives,
        "fnr_percentage": round(fnr * 100, 2),
        "rmse_log10_tvc": round(rmse, 3),
        "r2_score": round(max(0.0, r2), 3)
    }

if __name__ == "__main__":
    print("=" * 65)
    print("  OPTIX Conformal Prediction & FSSAI Standards Bench")
    print("  Team AEROS | SIH 2026 Problem Statement 26233")
    print("=" * 65)
    
    metrics = simulate_validation_cohort(404)
    print(f"\nCohort Validation Summary (N = {metrics['total_samples']} samples):")
    print(f"  • PASS Decisions        : {metrics['pass_count']} ({metrics['pass_count']/404*100:.1f}%)")
    print(f"  • DIVERT Decisions      : {metrics['divert_count']} ({metrics['divert_count']/404*100:.1f}%)")
    print(f"  • QUARANTINE Decisions  : {metrics['quarantine_count']} ({metrics['quarantine_count']/404*100:.1f}%)")
    print(f"  • False Negatives       : {metrics['false_negatives']} (FNR = {metrics['fnr_percentage']}%)")
    print(f"  • RMSE on log10 TVC     : {metrics['rmse_log10_tvc']} CFU/g")
    print(f"  • R² Goodness-of-Fit    : {metrics['r2_score']}")
    print("\n[OK] Conformal prediction bench successfully executed.")
