# Savecumulator simulation

# Reset simulation parameters.
reset_simulation <- function() {
  max_fuel  <<- 80
  used_fuel <<- 15 # try 15.
  remaining_fuel <<- max_fuel - used_fuel
  accumulated_discount_amount <<- 0.0
}

reset_simulation()

results <- list()

# Constants.
k_fuel_price <- 2
k_max_discounted_litres <- 50
k_discount_applies_spend <- 40
k_discount_amount <- 0.06

# Strategies ----
# 1. Accumulate discounts every fill up and use all on the last fill up.
# 2. Accumulate discounts every fill up but be sure the last fill up is eligible for discount ($40) and use all the discounts then.
# 3. Accumulate discounts every fill up until the last <= 50 litres to go.
# 4. Use discounts every fill up even if the last fill up is not eligible for the discount.
# 5. Use discounts every fill up but max out the fill on the last <= 50 litres. 

results["Cost"] <- remaining_fuel * fuel_price

# Strategy 1 ----
print("### Strategy 1 Simulation ###")
reset_simulation()
strategy_1_spend <- 0
accumulation_rounds <- 0
minimum_fillup_litres <- k_discount_applies_spend / k_fuel_price

# Check strategy accumulation rounds
while (accumulation_rounds * minimum_fillup_litres <= remaining_fuel) {
  filled_amount <- accumulation_rounds * minimum_fillup_litres
  accumulation_rounds <- accumulation_rounds + 1  
  
  if (remaining_fuel - filled_amount < minimum_fillup_litres) {
    accumulation_rounds <- accumulation_rounds - 1
    if (remaining_fuel - filled_amount == 0) {
      accumulation_rounds <- accumulation_rounds - 1
      break
    }
    break
  }
}
print(paste(accumulation_rounds, "rounds of accumulation."))

# Accumulation rounds
for (i in 1:accumulation_rounds) {
  remaining_fuel <- remaining_fuel - minimum_fillup_litres
  strategy_1_spend <- strategy_1_spend + (minimum_fillup_litres * k_fuel_price)
  accumulated_discount_amount <- accumulated_discount_amount + k_discount_amount
}

# Use round
savings <- accumulated_discount_amount * remaining_fuel
strategy_1_spend <- strategy_1_spend + (remaining_fuel * (k_fuel_price - accumulated_discount_amount))
print(strategy_1_spend)
print(savings)
results["Strategy1"] <- strategy_1_spend


# Strategy 2 ----
print("### Strategy 2 Simulation ###")
reset_simulation()
strategy_2_spend <- 0
accumulation_rounds <- 0
minimum_fillup_litres <- k_discount_applies_spend / k_fuel_price

# Check strategy accumulation rounds
while ((remaining_fuel - (accumulation_rounds * minimum_fillup_litres)) >= minimum_fillup_litres) {
  filled_amount <- accumulation_rounds * minimum_fillup_litres
  accumulation_rounds <- accumulation_rounds + 1
  if ((remaining_fuel - (filled_amount + minimum_fillup_litres)) < minimum_fillup_litres) {
    accumulation_rounds <- accumulation_rounds - 1
    break
  }
}
print(paste0(accumulation_rounds, " round", rep("s", accumulation_rounds - 1), " of accumulation."))

# Accumulation rounds
for (i in 1:accumulation_rounds) {
  remaining_fuel <- remaining_fuel - minimum_fillup_litres
  strategy_2_spend <- strategy_2_spend + (minimum_fillup_litres * k_fuel_price)
  accumulated_discount_amount <- accumulated_discount_amount + k_discount_amount
}

# Use round
savings <- accumulated_discount_amount * remaining_fuel
strategy_2_spend <- strategy_2_spend + (remaining_fuel * (k_fuel_price - accumulated_discount_amount))
print(strategy_2_spend)
print(savings)
results["Strategy2"] <- strategy_2_spend

# Strategy 3 ----
print("### Strategy 3 Simulation ###")
reset_simulation()
strategy_3_spend <- 0
accumulation_rounds <- 0
minimum_fillup_litres <- k_discount_applies_spend / k_fuel_price

# Check strategy accumulationn rounds
while ((remaining_fuel - (accumulation_rounds * minimum_fillup_litres)) >= k_max_discounted_litres) {
  accumulation_rounds <- accumulation_rounds + 1
}
print(paste0(accumulation_rounds, " round", rep("s", accumulation_rounds - 1), " of accumulation."))

# Accumulation round
for (i in 1:accumulation_rounds) {
  remaining_fuel <- remaining_fuel - minimum_fillup_litres
  strategy_3_spend <- strategy_3_spend + (minimum_fillup_litres * k_fuel_price)
  accumulated_discount_amount <- accumulated_discount_amount + k_discount_amount
}

# Use round
savings <- accumulated_discount_amount * remaining_fuel
strategy_3_spend <- strategy_3_spend + (remaining_fuel * (k_fuel_price - accumulated_discount_amount))
print(strategy_3_spend)
print(savings)
results["Strategy3"] <- strategy_3_spend

# Strategy 4 ----
print("### Strategy 4 Simulation ###")
reset_simulation()
strategy_4_spend <- 0
savings <- 0
minimum_fillup_litres <- k_discount_applies_spend / k_fuel_price
fill_rounds <- 0

while (remaining_fuel > 0) {
  if (remaining_fuel >= minimum_fillup_litres) {
    fill_rounds <- fill_rounds + 1
    remaining_fuel <- remaining_fuel - minimum_fillup_litres
    accumulated_discount_amount <- accumulated_discount_amount + k_discount_amount
    print(
      paste0(
        "Round ", 
        fill_rounds, 
        ": ", 
        minimum_fillup_litres, 
        " l filled with ", 
        accumulated_discount_amount, 
        " off/l discount used. Spent ", 
        (minimum_fillup_litres * (fuel_price - accumulated_discount_amount)),
        " (",
        (minimum_fillup_litres * fuel_price),
        " - ",
        (minimum_fillup_litres * accumulated_discount_amount),
        ")."
      )
    )
    strategy_4_spend <- strategy_4_spend + (minimum_fillup_litres * (fuel_price - accumulated_discount_amount))
    savings <- savings + (minimum_fillup_litres * accumulated_discount_amount)
    accumulated_discount_amount <- 0
  } else {
    fill_rounds <- fill_rounds + 1
    print(
      paste0(
        "Round ", 
        fill_rounds, 
        ": ", 
        remaining_fuel ,
        " l filled with ", 
        accumulated_discount_amount, 
        " off/l discount used. Spent ", 
        (remaining_fuel * fuel_price))
    )
    strategy_4_spend <- strategy_4_spend + (remaining_fuel * fuel_price)
    remaining_fuel <- remaining_fuel - remaining_fuel
  }
}
print(strategy_4_spend)
print(savings)
results["Strategy4"] <- strategy_4_spend

# Strategy 5 ----
print("### Strategy 5 Simulation ###")
reset_simulation()
strategy_5_spend <- 0
savings <- 0
minimum_fillup_litres <- k_discount_applies_spend / k_fuel_price
fill_rounds <- 0

while (remaining_fuel > 0) {
  if (remaining_fuel > k_max_discounted_litres) {
    fill_rounds <- fill_rounds + 1
    remaining_fuel <- remaining_fuel - minimum_fillup_litres
    accumulated_discount_amount <- accumulated_discount_amount + k_discount_amount
    print(
      paste0(
        "Round ", 
        fill_rounds, 
        ": ", 
        minimum_fillup_litres, 
        " l filled with ", 
        accumulated_discount_amount, 
        " off/l discount used. Spent ", 
        (minimum_fillup_litres * (fuel_price - accumulated_discount_amount)),
        " (",
        (minimum_fillup_litres * fuel_price),
        " - ",
        (minimum_fillup_litres * accumulated_discount_amount),
        ")."
      )
    )
    strategy_5_spend <- strategy_5_spend + (minimum_fillup_litres * (fuel_price - accumulated_discount_amount))
    savings <- savings + (minimum_fillup_litres * accumulated_discount_amount)
    accumulated_discount_amount <- 0
  } else {
    fill_rounds <- fill_rounds + 1
    
    if (remaining_fuel * fuel_price >= k_discount_applies_spend) {
      accumulated_discount_amount <- accumulated_discount_amount + k_discount_amount
    }
    
    print(
      paste0(
        "Round ", 
        fill_rounds, 
        ": ", 
        remaining_fuel ,
        " l filled with ", 
        accumulated_discount_amount, 
        " off/l discount used. Spent ", 
        (remaining_fuel * (fuel_price - accumulated_discount_amount)),
        " (",
        (remaining_fuel * fuel_price),
        " - ",
        (remaining_fuel * accumulated_discount_amount),
        ")."
      )
    )

    strategy_5_spend <- strategy_5_spend + (remaining_fuel * (fuel_price - accumulated_discount_amount))
    savings <- savings + (remaining_fuel * accumulated_discount_amount)
    remaining_fuel <- remaining_fuel - remaining_fuel
  }
}
print(strategy_5_spend)
print(savings)
results["Strategy5"] <- strategy_5_spend


