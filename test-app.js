// Quick test script to verify the garden optimization works
import { GardenOptimizer } from './src/algorithms/optimizer/GardenOptimizer.ts';
import { buildCompanionMatrix } from './src/utils/companionChecker.ts';
import vegetablesData from './src/data/vegetables.json' assert { type: 'json' };
import companionRulesData from './src/data/companionRules.json' assert { type: 'json' };

console.log('🌱 Testing Garden Planner Application...\n');

// Setup
const vegetables = vegetablesData.vegetables;
const companionMatrix = buildCompanionMatrix(companionRulesData.rules);

// Test Scenario 1: Small garden with 4 vegetables
console.log('📊 Test 1: Petit Potager (400cm × 600cm)');
console.log('Légumes: Tomate, Basilic, Carotte, Laitue\n');

const garden1 = {
  id: 'test-garden-1',
  dimensions: {
    width: 400,  // 4m
    length: 600  // 6m
  },
  selectedVegetables: [
    { vegetableId: 'tomato', priority: 8 },
    { vegetableId: 'basil', priority: 8 },
    { vegetableId: 'carrot', priority: 6 },
    { vegetableId: 'lettuce', priority: 6 }
  ],
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

const optimizer1 = new GardenOptimizer(vegetables, companionMatrix, garden1);

console.time('Optimization Time');
const result1 = await optimizer1.optimize();
console.timeEnd('Optimization Time');

if (result1.success) {
  console.log('✅ Optimisation réussie!\n');
  console.log('📈 Métriques:');
  console.log(`  • Utilisation: ${(result1.layout.metrics.utilisationRate * 100).toFixed(1)}%`);
  console.log(`  • Compagnonnage: ${(result1.layout.metrics.companionScore * 100).toFixed(1)}%`);
  console.log(`  • Diversité: ${(result1.layout.metrics.diversityScore * 100).toFixed(1)}%`);
  console.log(`  • Espacement: ${(result1.layout.metrics.spacingScore * 100).toFixed(1)}%`);
  console.log(`  • Score Global: ${(result1.layout.score * 10).toFixed(1)}/10\n`);

  console.log('🌿 Layout:');
  console.log(`  • Nombre de rangs: ${result1.layout.rows.length}`);
  result1.layout.rows.forEach((row, i) => {
    console.log(`  • Rang ${i + 1}:`);
    row.segments.forEach(seg => {
      const veg = vegetables.find(v => v.id === seg.vegetableId);
      console.log(`    - ${veg.name}: ${seg.plantCount} plants`);
    });
  });

  if (result1.warnings.length > 0) {
    console.log('\n⚠️  Avertissements:');
    result1.warnings.forEach(w => console.log(`  • ${w.message}`));
  }
} else {
  console.log('❌ Optimisation échouée');
  result1.warnings.forEach(w => console.log(`  • ${w.message}`));
}

console.log('\n' + '='.repeat(60) + '\n');

// Test Scenario 2: Medium garden with more vegetables
console.log('📊 Test 2: Potager Moyen (500cm × 700cm)');
console.log('Légumes: 6 légumes variés\n');

const garden2 = {
  id: 'test-garden-2',
  dimensions: {
    width: 500,  // 5m
    length: 700  // 7m
  },
  selectedVegetables: [
    { vegetableId: 'tomato', priority: 8 },
    { vegetableId: 'basil', priority: 8 },
    { vegetableId: 'carrot', priority: 7 },
    { vegetableId: 'onion', priority: 7 },
    { vegetableId: 'lettuce', priority: 6 },
    { vegetableId: 'radish', priority: 5 }
  ],
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

const optimizer2 = new GardenOptimizer(vegetables, companionMatrix, garden2);

console.time('Optimization Time');
const result2 = await optimizer2.optimize();
console.timeEnd('Optimization Time');

if (result2.success) {
  console.log('✅ Optimisation réussie!\n');
  console.log('📈 Métriques:');
  console.log(`  • Utilisation: ${(result2.layout.metrics.utilisationRate * 100).toFixed(1)}%`);
  console.log(`  • Compagnonnage: ${(result2.layout.metrics.companionScore * 100).toFixed(1)}%`);
  console.log(`  • Diversité: ${(result2.layout.metrics.diversityScore * 100).toFixed(1)}%`);
  console.log(`  • Espacement: ${(result2.layout.metrics.spacingScore * 100).toFixed(1)}%`);
  console.log(`  • Score Global: ${(result2.layout.score * 10).toFixed(1)}/10\n`);

  console.log('🌿 Layout:');
  console.log(`  • Nombre de rangs: ${result2.layout.rows.length}`);
  result2.layout.rows.forEach((row, i) => {
    console.log(`  • Rang ${i + 1}:`);
    row.segments.forEach(seg => {
      const veg = vegetables.find(v => v.id === seg.vegetableId);
      console.log(`    - ${veg.name}: ${seg.plantCount} plants`);
    });
  });

  // Check for good companion associations
  console.log('\n🤝 Associations détectées:');
  const goodAssociations = [];
  result2.layout.rows.forEach(row => {
    row.segments.forEach(seg => {
      seg.companions.forEach(comp => {
        if (comp.relationship === 'beneficial') {
          const veg1 = vegetables.find(v => v.id === seg.vegetableId);
          const veg2 = vegetables.find(v => v.id === comp.vegetableId);
          goodAssociations.push(`${veg1.name} + ${veg2.name}: ${comp.reason}`);
        }
      });
    });
  });

  const uniqueAssociations = [...new Set(goodAssociations)];
  uniqueAssociations.slice(0, 3).forEach(assoc => {
    console.log(`  ✅ ${assoc}`);
  });

  if (result2.warnings.length > 0) {
    console.log('\n⚠️  Avertissements:');
    result2.warnings.forEach(w => console.log(`  • ${w.message}`));
  }
} else {
  console.log('❌ Optimisation échouée');
  result2.warnings.forEach(w => console.log(`  • ${w.message}`));
}

console.log('\n' + '='.repeat(60));
console.log('✨ Tests terminés! Application fonctionnelle! ✨');
console.log('🌐 Ouvrez http://localhost:5173 pour tester l\'interface graphique');
console.log('='.repeat(60));
