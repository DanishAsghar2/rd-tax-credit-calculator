<template>
    <div :class="['calculator-container', { 'dark-mode': isDarkMode }]">
      <h1>R&D Tax Credit Calculator</h1>
  
      <div class="form-group">
        <label for="currency">Currency:</label>
        <select v-model="currency" id="currency">
          <option value="GBP">GBP</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
  
      <div class="form-group">
        <label for="qualified-expenses">
          Qualified R&D Expenses ({{ currency }})
          <span class="tooltip" title="Total expenses that qualify for R&D tax credit.">?</span>
        </label>
        <input
          type="number"
          v-model.number="qualifiedExpenses"
          id="qualified-expenses"
          required
          aria-required="true"
        />
        <span v-if="qualifiedExpenses < 0" class="error">Expenses must be positive.</span>
      </div>
  
      <div class="form-group">
        <label for="tax-rate">
          Tax Credit Rate (%)
          <span class="tooltip" title="The percentage of expenses eligible for tax credit.">?</span>
        </label>
        <input
          type="number"
          v-model.number="taxRate"
          id="tax-rate"
          required
          aria-required="true"
        />
        <span v-if="taxRate < 0 || taxRate > 100" class="error">Enter a valid tax rate (0-100%).</span>
      </div>
  
      <button @click="calculateTaxCredit" :disabled="!formIsValid" class="calculate-button">
        Calculate Tax Credit
      </button>
  
      <div v-if="taxCredit !== null" ref="resultsSection" class="result-container">
        <div class="result">
          <h2>Your Estimated R&D Tax Credit:</h2>
          <p>{{ currencySymbol }}{{ taxCredit.toFixed(2) }}</p>
          <div class="breakdown">
            <h3>Calculation Breakdown:</h3>
            <p>Qualified Expenses: {{ currencySymbol }}{{ qualifiedExpenses }}</p>
            <p>Tax Rate: {{ taxRate }}%</p>
            <p>Calculated Credit: {{ currencySymbol }}{{ (qualifiedExpenses * taxRate / 100).toFixed(2) }}</p>
          </div>
        </div>
  
        <div class="chart-container">
          <canvas id="taxCreditChart"></canvas>
        </div>
      </div>
  
      <div class="button-group">
        <button @click="exportToPDF" v-if="taxCredit !== null" class="export-button">
          Export to PDF
        </button>
  
        <button @click="toggleDarkMode" class="toggle-button">
          Toggle Dark Mode
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { Chart } from 'chart.js/auto';
  import jsPDF from 'jspdf';
  import { nextTick } from 'vue';
  
  export default {
    data() {
      return {
        qualifiedExpenses: null,
        taxRate: null,
        taxCredit: null,
        currency: 'GBP',
        isDarkMode: false,
        chart: null,
      };
    },
    computed: {
      formIsValid() {
        return this.qualifiedExpenses > 0 && this.taxRate >= 0 && this.taxRate <= 100;
      },
      currencySymbol() {
        switch (this.currency) {
          case 'USD':
            return '$';
          case 'EUR':
            return '€';
          case 'GBP':
          default:
            return '£';
        }
      }
    },
    methods: {
      async calculateTaxCredit() {
        if (this.formIsValid) {
          this.taxCredit = (this.qualifiedExpenses * this.taxRate) / 100;
          this.renderChart();
          await this.$nextTick();  // Wait for DOM to update
          this.scrollToResults();  // Scroll to the results section
        } else {
          this.taxCredit = null;
        }
      },
      renderChart() {
        nextTick(() => {
          const ctx = document.getElementById('taxCreditChart').getContext('2d');
          if (this.chart) {
            this.chart.destroy();
          }
          try {
            this.chart = new Chart(ctx, {
              type: 'pie',
              data: {
                labels: ['Tax Credit', 'Remaining Expenses'],
                datasets: [
                  {
                    data: [
                      this.taxCredit,
                      this.qualifiedExpenses - this.taxCredit,
                    ],
                    backgroundColor: ['#FF6F61', '#6B5B95'],
                  },
                ],
              },
              options: {
                animation: {
                  duration: 1500,
                  easing: 'easeInOutBounce'
                },
              },
            });
          } catch (error) {
            console.error('Error rendering chart:', error);
          }
        });
      },
      exportToPDF() {
        try {
          const doc = new jsPDF();
          doc.text('R&D Tax Credit Results', 10, 10);
          doc.text(
            `Qualified Expenses: ${this.currencySymbol}${this.qualifiedExpenses}`,
            10,
            20
          );
          doc.text(`Tax Credit Rate: ${this.taxRate}%`, 10, 30);
          doc.text(
            `Tax Credit: ${this.currencySymbol}${this.taxCredit.toFixed(2)}`,
            10,
            40
          );
          doc.save('tax-credit-results.pdf');
        } catch (error) {
          console.error('Error exporting to PDF:', error);
          alert('An error occurred while exporting the PDF. Please try again.');
        }
      },
      toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
      },
      scrollToResults() {
        this.$nextTick(() => {
          const resultsSection = this.$refs.resultsSection;
          if (resultsSection) {
            try {
              resultsSection.scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
              console.error('Error scrolling to results:', error);
            }
          } else {
            console.error('Results section ref not found.');
          }
        });
      }
    },
    beforeUnmount() {
      if (this.chart) {
        this.chart.destroy();
      }
    },
  };
  </script>
  <style scoped>
  .calculator-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 30px;
    background-color: #f0f4f8;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s ease;
  }
  
  .dark-mode {
    background-color: #1e1e1e;
    color: #ffffff;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }
  
  input[type="number"],
  select {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    transition: border-color 0.3s ease;
  }
  
  input[type="number"]:focus,
  select:focus {
    border-color: #007bff;
  }
  
  button {
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  button:hover:not(:disabled) {
    background-color: #0056b3;
    transform: translateY(-2px);
  }
  
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .calculate-button {
    background-color: #007bff;
    color: white;
    width: 100%;
    margin-bottom: 20px;
  }
  
  .result-container {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-top: 20px;
  }
  
  .result {
    flex: 1;
    margin-right: 20px;
    padding: 20px;
    background-color: #e9ecef;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .chart-container {
    flex: 1;
    max-width: 350px;
    margin-top: 20px;
  }
  
  canvas {
    width: 100%;
    height: auto;
  }
  
  .breakdown {
    margin-top: 20px;
  }
  
  .tooltip {
    cursor: pointer;
    color: #007bff;
    text-decoration: underline;
  }
  
  .error {
    color: red;
    font-size: 0.9em;
  }
  
  .button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    flex-wrap: wrap;
  }
  
  .export-button {
    background-color: #28a745;
    color: white;
    flex: 1;
    margin-right: 10px;
    margin-bottom: 10px;
  }
  
  .toggle-button {
    background-color: #ffc107;
    color: white;
    flex: 1;
    margin-bottom: 10px;
  }
  
  @media (max-width: 768px) {
    .result-container {
      flex-direction: column;
    }
  
    .chart-container {
      margin-top: 20px;
      max-width: 100%;
    }
  
    .button-group {
      flex-direction: column;
    }
  
    .export-button,
    .toggle-button {
      margin-right: 0;
    }
  }
  </style>
  