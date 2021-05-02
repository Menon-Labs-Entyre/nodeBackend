import re
import difflib
import csv
from enum import Enum
from collections import OrderedDict
from collections import defaultdict
import sys
import json

DB_PATH='./services/parsed_drug_name_agg.csv'
def read_drug_db(db_path=DB_PATH):
    df_in = OrderedDict()
    with open(db_path) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            high_amount = row['high_amount'].strip()
            if high_amount =="":
                high_amount = None
            else:
                high_amount = float(high_amount)
            df_in[row['drug_name']] = {"high_amount":high_amount,
                               "high_unit": row['high_unit'].strip()}
    return df_in

df_in = read_drug_db(DB_PATH)

IACT_PATH='./services/trimmed_interaction_dataset_entyre.csv'
def read_interact_db(db_path=IACT_PATH):
    def parse_number(x,nfunc=float):
        '''nfunc is either float or int'''
        x = x.strip()
        if x =="":
            x = None
        else:
            x = nfunc(x)
        return x

    df_in = OrderedDict()
    with open(db_path) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            pid = parse_number(row['pid'],int)
            total_n = parse_number(row['total_number'])
            w_n = parse_number(row['weighted_number'])

            df_in[pid] = {"total_number":total_n,
                               "weighted_number": w_n}
    return df_in

interact_db = read_interact_db(IACT_PATH)
db_total_number_interactions = [v["total_number"] for v in interact_db.values()]
db_weighted_number_interactions = [v["weighted_number"] for v in interact_db.values()]
MAP_SEVERITY_SCORE_DICT= {
    "minor":0.25,
    "moderate":1,
    "major":4
}

DRUG_NAMES = [k.lower() for k in df_in.keys()]
DF_IN_KEYS = list(df_in.keys())
OD_MULTIPLIER = 1.2 # percent over the high amount that we'll considered as OVERDOSE
MATCH_THRESHOLD_FOR_CONDITIONS = 0.5


class CheckResults(Enum):
    NO_DRUG_MATCH = -1
    DIFFERENT_UNIT = -2
    NO_DRUG_INFO = -3
    SUCCESS = 1
    UNKNOWN_ERROR = -4

def get_drug_info_from_database(drug_name):
    drug_name = drug_name.lower()

    closest_match = difflib.get_close_matches(drug_name, DRUG_NAMES, n=1)

    if len(closest_match) == 0:
        raise ValueError('No Drug Match')
    else:
        closest_match = closest_match[0]

    drug_info = df_in[DF_IN_KEYS[DRUG_NAMES.index(closest_match)]]
    high_amount,high_unit = drug_info['high_amount'],drug_info['high_unit']
    return high_amount, high_unit

def check_overdosage(drug_name,amount,unit):
    try:
        try:
            high_amount, high_unit = get_drug_info_from_database(drug_name)
        except ValueError:
            return (CheckResults.NO_DRUG_MATCH,False)

        if high_amount is None:
            return (CheckResults.NO_DRUG_INFO,False)
        if unit != high_unit:
            # different unit, cannot compare
            return (CheckResults.DIFFERENT_UNIT,False)
        if amount > OD_MULTIPLIER*high_amount:
            return (CheckResults.SUCCESS,True)
        else:
            return (CheckResults.SUCCESS,False)
    except:
        return (CheckResults.UNKNOWN_ERROR,False)

def check_wrong_prescription(drug_conditions,patient_conditions):
    '''check that among all conditions this drug is prescribed for,
    the patient also has at least one this condition
    patient_conditions: list of conditions that they patient have in string ["ADHD","Depression"]
    drug_conditions: list of conditions that the drugs are meant to be prescribed for
    wrongly_prescribed_dict: dict of format {"conditionA":True,"conditionB":False}
        True means that this drug doesnt treat any of the patient's conditions,
                        False means that we're fine nothing to worry about
    '''
    wrongly_prescribed_dict = {}
    for patient_condition in patient_conditions:
        closest_diagnosis_matches = difflib.get_close_matches(patient_condition,
              drug_conditions,cutoff=MATCH_THRESHOLD_FOR_CONDITIONS)
        if len(closest_diagnosis_matches) == 0:
            wrongly_prescribed_dict[patient_condition] = True
        else:
            wrongly_prescribed_dict[patient_condition] = False
    return wrongly_prescribed_dict

def check_interaction(interactions):
    DRUG_PAIR_DELIMITER = '--&--'
    def generate_key(drugA_name,drugB_name):
        return DRUG_PAIR_DELIMITER.join(sorted([drugA_name,drugB_name]))
    def deconstruct_drug_pair_key(drug_pair_key):
        return tuple(drug_pair_key.split(DRUG_PAIR_DELIMITER))


    # capture out only relevant interaction information that we want
    results_d = defaultdict(lambda: [])
    for interaction_pair in interactions:
        drugA_name = interaction_pair['product_concept_name']
        drugB_name = interaction_pair['affected_product_concept_name']
        drugA_ingredient = interaction_pair['product_ingredient']['name']
        drugB_ingredient = interaction_pair['affected_product_ingredient']['name']

        drug_pair_key = generate_key(drugA_name,drugB_name)
        results_d[drug_pair_key].append(
            {"ingredient1":drugA_ingredient,
             "ingredient2":drugB_ingredient,
              "severity":interaction_pair['severity'],
             "description":interaction_pair['description'],
            }
            )

    results_l = []
    for drug_pair_key, details in results_d.items():
        drugA_name,drugB_name = deconstruct_drug_pair_key(drug_pair_key)
        one_pair_d = {}
        one_pair_d["medA"] = drugA_name
        one_pair_d["medB"] = drugB_name
        one_pair_d["ingredient_details"] = details
        total_n = len(details) # total number of interactions
        one_pair_d["total_number_in_pair"] = total_n
        results_l.append(one_pair_d)

    return results_l


def map_severity_to_score(severity_str):
    return MAP_SEVERITY_SCORE_DICT[severity_str]

def calculate_weighted_interaction(ingredient_details):
    return sum(
                [map_severity_to_score(ingredient_pair['severity'])
                 for ingredient_pair in ingredient_details
                ]
                 )


def calculate_interaction_percentile(compare_point,db_list):
    bool_arr = list(map(lambda x: x < compare_point,db_list))
    return sum(bool_arr)/len(bool_arr)*100

def check_medication_plan(data):
    '''medication_plan: a JSON-like dict of format
        {"condition A":
            {"medications": # list of dictionary
                    [{"medication_name": "drugA",
                        "dose":"100",
                        "unit":"mg"
                     },{"medication_name": "drugB",...},..]
            },
        "condition B":
            {"medications": [...] }
        Output: results_dict: a JSON-like dict of format
        {"condition A":
            {"drugA": {"is_overdose":True,
                        "is_wrongly_prescribed":True,
                        "recommended_conditions_for_prescription":['Alcohol Dependence',
                                                'Anorexia Nervosa','Bulimia Nervosa','Cataplexy']
                     },

            "drugB": {"is_overdose":...,
                    "is_wrongly_prescribed":...,
                    "recommended_conditions_for_prescription":...},
            ...}
            ,
        "condition B": {...}
        }
    '''
    medication_plan = data["medication_plan"]
    interactions = data["interactions"]

    '''
    [
        {
            "overdoes": true,
            "wrongly_prescribed": false
        },
        {
            "overdoes": false,
            "wrontly_prescribed": true
        }
    ]
    '''
    #basic check
    results_dict = {}
    valid_check = []
    patient_conditions = list(medication_plan.keys())
    
    for condition,medications in medication_plan.items():
        results_dict[condition] = {}
        for medication_dict in medications:
            drug_name = medication_dict['details']['name']
            results_dict[condition][drug_name] = {}
            med_patient_input = medication_dict["patient_input"]
            amount = med_patient_input['dose']
            unit = med_patient_input['unit']
            check_flag,is_overdose = check_overdosage(drug_name,amount,unit)
            results_dict[condition][drug_name]['overdose'] = is_overdose

            drug_conditions_dicts = medication_dict['indications']
            drug_conditions = list(set(
                [condition_['condition']['name'] for condition_ in drug_conditions_dicts if 'condition' in condition_]))

            wrongly_prescribed_dict = check_wrong_prescription(drug_conditions,patient_conditions)
            # need all True to returns True, it is because the drug only needs to be prescribed
            # for a single patient condition from all patient conditions
            is_drug_wrongly_prescribed = sum(list(wrongly_prescribed_dict.values())) == len(wrongly_prescribed_dict)
            results_dict[condition][drug_name]['wrongly_prescribed'] = is_drug_wrongly_prescribed
            results_dict[condition][drug_name]['recommended_conditions_for_prescription'] = drug_conditions
            
            valid_check.append(
                {
                    "overdoes": is_overdose, 
                    "wrongly_prescribed": is_drug_wrongly_prescribed, 
                    "recommended_conditions_for_prescription": drug_conditions
                }
            )


    interaction_result_l = check_interaction(interactions)
    ddi = {}
    total_n_of_plan = 0
    weighted_n_total = 0
    for one_pair_dict in interaction_result_l:
        total_n_of_plan += one_pair_dict['total_number_in_pair']
        weighted_n_of_pair = calculate_weighted_interaction(
            one_pair_dict['ingredient_details'])
        weighted_n_total += weighted_n_of_pair

    ddi["details"] = interaction_result_l
    ddi["total_number"] = total_n_of_plan
    ddi["weighted_number"] = weighted_n_total
    ddi["percentile"] = calculate_interaction_percentile(total_n_of_plan,
                                                         db_total_number_interactions)
    ddi["weighted_percentile"] = calculate_interaction_percentile(weighted_n_total,
                                                         db_weighted_number_interactions)


    output_results_dict = {}
    output_results_dict["validation"] = valid_check #results_dict
    output_results_dict["ddi"] = ddi

    return output_results_dict

def test(data):
    final_data = check_medication_plan(json.loads(data))
    print(json.dumps(final_data))
    sys.stdout.flush()


if __name__ =='__main__' :
    test(sys.argv[1])
