#!/usr/bin/env python

import os, argparse, json

def main(args):
    questions = []
    for line in args.source:
        question,answer = line.strip().split("*")
        questions.append({
            'question': question,
            'answer': answer
        })
    
    print(json.dumps(questions));


def is_valid_file(parser, arg):
    if not os.path.exists(arg):
        parser.error("the file %s does not exist." % arg)
    else:
        return open(arg, 'r')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description="Converts question set from old mIRC txt format to JSON.")
    parser.add_argument(
        "--source",
        dest="source",
        help="Question set file to convert",
        metavar="PATH",
        required=True,
        type=lambda x: is_valid_file(parser, x))

    args = parser.parse_args()
    main(args)
