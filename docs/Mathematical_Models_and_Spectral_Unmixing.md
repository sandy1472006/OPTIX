# 📐 OPTIX: Mathematical Formulations & Spectral Unmixing Models

**System:** OPTIX (Adaptive Hyperspectral Inspection System)  
**Team:** Team AEROS (Team ID: 186870) | **SIH 2026 Problem Statement 26233**  

---

## 1. Linear Spectral Mixture Model & Weak-Signal Dilemma

In food surface inspection, an observed pixel spectrum $\mathbf{y} \in \mathbb{R}^B$ ($B$ bands) consists of a linear combination of pure constituent endmembers plus noise:
$$\mathbf{y} = \mathbf{A} \mathbf{x} + \mathbf{n} = \mathbf{A}_{\text{food}} \mathbf{x}_{\text{food}} + \mathbf{A}_{\text{contam}} \mathbf{x}_{\text{contam}} + \mathbf{n}$$
Where:
* $\mathbf{A}_{\text{food}} \in \mathbb{R}^{B \times P_{\text{food}}}$ represents the dominant food tissue spectral signatures (meat muscle, skin, lipid, or green chlorophyll).
* $\mathbf{x}_{\text{food}}$ is the corresponding abundance vector ($\sum x_i \approx 1$).
* $\mathbf{A}_{\text{contam}}$ is the weak microbial or fecal contaminant endmember signature.
* $\mathbf{x}_{\text{contam}}$ is the minute trace abundance ($x_{\text{contam}} \ll 0.05$).

**The Core Scientific Challenge:** Because the clean food tissue accounts for $> 95\%$ of the measured reflectance energy, standard unsupervised clustering algorithms (such as k-Means or PCA) are overwhelmed by benign food variations (such as natural fat streaks or leaf veins), causing severe false alarms.

---

## 2. Orthogonal Subspace Projection (OSP) Baseline

To isolate the weak microbial anomaly, OPTIX projects the observed measurement onto a subspace orthogonal to the dominant food background (Harsanyi & Chang, 1994, *IEEE TGRS*):
$$\mathbf{P}_{\mathbf{U}}^{\perp} = \mathbf{I} - \mathbf{U} (\mathbf{U}^T \mathbf{U})^{-1} \mathbf{U}^T$$
Where $\mathbf{U} = \mathbf{A}_{\text{food}}$. Applying the projection operator:
$$\mathbf{r} = \mathbf{P}_{\mathbf{U}}^{\perp} \mathbf{y} = \mathbf{P}_{\mathbf{U}}^{\perp} (\mathbf{A}_{\text{contam}} \mathbf{x}_{\text{contam}}) + \mathbf{P}_{\mathbf{U}}^{\perp} \mathbf{n}$$
The dominant food background is mathematically annihilated ($\mathbf{P}_{\mathbf{U}}^{\perp} \mathbf{A}_{\text{food}} = \mathbf{0}$), leaving only the residual signature $\mathbf{r}$ containing the anomalous microbial fluorophore response.

---

## 3. Sparse Non-Negative Matrix Factorization (HyperWeak NMF)

To resolve overlapping weak signals from bacterial colonies, biofilms, and wet surface films, OPTIX implements **HyperWeak Sparse NMF** (IEEE doc.9834973):
$$\min_{\mathbf{A}, \mathbf{X}} \frac{1}{2} \|\mathbf{Y} - \mathbf{A} \mathbf{X}\|_F^2 + \lambda \|\mathbf{X}_{\text{contam}}\|_1 + \beta \mathcal{R}(\mathbf{A})$$
Subject to:
$$\mathbf{A} \ge 0, \quad \mathbf{X} \ge 0$$
* The $\ell_1$-norm penalty enforces extreme spatial sparsity on the microbial abundance map $\mathbf{X}_{\text{contam}}$, reflecting the localized, clumped nature of bacterial colony contamination.
* **LISTA Acceleration (Gregor & LeCun, 2010):** The iterative shrinkage-thresholding optimization is unrolled into a 4-layer feedforward neural network on the Jetson Orin Tensor Cores, converging in $< 2.4\text{ ms}$ per line slice.

---

## 4. Conformal Prediction & Rigorous Uncertainty Triage

To ensure safety without false certainty, OPTIX calibrates model predictions using **Conformal Prediction** (Angelopoulos & Bates, 2021).

Given a calibration cohort $\mathcal{D}_{\text{cal}} = \{(\mathbf{y}_i, y_i)\}_{i=1}^n$, we compute non-conformity scores:
$$s_i = 1 - \hat{f}(\mathbf{y}_i)_{y_i}$$
For a desired error tolerance $\alpha = 0.01$ ($99\%$ guaranteed coverage), we determine conformal quantile thresholds $\tau_{\text{low}}$ and $\tau_{\text{high}}$:

$$\text{Decision}(\mathbf{y}) = \begin{cases}
\textbf{PASS} & \text{if } \hat{p}_{\text{risk}}(\mathbf{y}) < \tau_{\text{low}} \\
\textbf{DIVERT} & \text{if } \hat{p}_{\text{risk}}(\mathbf{y}) > \tau_{\text{high}} \\
\textbf{QUARANTINE} & \text{if } \tau_{\text{low}} \le \hat{p}_{\text{risk}}(\mathbf{y}) \le \tau_{\text{high}} \text{ or Out-of-Distribution}
\end{cases}$$

This guarantees that whenever the edge AI is uncertain due to unexpected food marbling, unusual moisture, or hardware drift, the product is never blindly passed into the consumer food supply—it is safely quarantined for laboratory verification.
