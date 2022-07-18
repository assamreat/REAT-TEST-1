const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validateChecklistInput = require('../../validation/checklist');

// Middlewares
const auth = require('../../middleware/auth');
const isRegistrar = require('../../middleware/isRegistrar');

// Models
const Appeal = require('../../models/Appeal');
const AppealState = require('../../models/AppealState');
const Checklist = require('../../models/Checklist');
const RevertedAppeal = require('../../models/RevertedAppeal');

// @route Post api/registrar/appeals
// @desc  View all Appeals - with registrar
// @access Private
router.get('/appeals', auth, isRegistrar, async (req, res) => {
    try {
        // find all appealIds where appealState is registrar:1
        const appealIds = await AppealState.findAll({
            attributes: ['appealId'],
            where: {
                registrar: 1,
            },
        });

        // return an array of appealIds in the form [{appealId: 3}, {appealId: 4}]
        const appealIdsRaw = appealIds.map((appealId) => {
            return appealId.get({ plain: true });
        });

        // returns an array of appealIds in the form [3,4]
        const appealIdsArray = appealIdsRaw.map((id) => {
            return id.appealId;
        });

        // find the appeals with registrar from appeals table
        const appeals = await Appeal.findAll({
            where: {
                id: appealIdsArray,
            },
        });

        res.json(appeals);
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

// @route GET api/registrar/appeals/:id
// @desc  View a single appeal details
// @access Private
router.get('/appeals/:id', auth, isRegistrar, async (req, res) => {
    try {
        const appeal = await Appeal.findOne({
            where: {
                id: req.params.id,
            },
        });

        res.json(appeal);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route POST api/registrar/appeals/:id/checklist
// @desc  create checklist (Form A)
// @access Private

router.post(
    '/appeals/:id/checklist',
    validateChecklistInput,
    auth,
    isRegistrar,
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // return res.status(400).json({ errors: errors.array() });

            let errObj = {};
            errors.array().map((error) => {
                errObj[error.param] = error.msg;
            });
            return res.status(400).json(errObj);
        }

        const {
            appealNum,
            complaintNum,
            appellant,
            respondent,
            sectionNum,
            isAppealCompetent,
            isNameAddressCorrect,
            isOrdercopyAttached,
            dateOfOrder,
            dateOfCommunication,
            dateOfApplication,
            dateOnCopyReady,
            dateOfReceipt,
            dateOfFiling,
            dateOfSubmissionHardcopy,
            isDelayOnSubmission,
            amountOfDelayOnSubmission,
            isAppealFiledWithinLimitation,
            isDelayInFiling,
            amountOfDelayInFiling,
            isCondonationOfDelayFiled,
            objectionForCondonation,
            isFeesPaid,
            dateOfPayment,
            copyOfReceipt,
            isPaginationCorrect,
            legibleDocs,
            isAppealMemoAnnexed,
            isServedByPost,
            isAuthStamped,
            isEmailPhoneOnRecord,
        } = req.body;
        const appealId = req.params.id;

        try {
            // See if appeal exits or not
            const existingAppeal = await Appeal.findOne({
                where: { id: appealId },
            });

            if (!existingAppeal) {
                return res.status(400).json({
                    msg: 'no existing appeal',
                });
            }

            // See if checklist is already filled
            const existingChecklist = await Checklist.findOne({
                where: { appealId: appealId },
            });

            if (existingChecklist) {
                await Checklist.update(
                    {
                        appeal_num: appealNum,
                        complaint_num: complaintNum,
                        appellant: appellant,
                        respondent: respondent,
                        section_num: sectionNum,
                        is_appeal_competent: isAppealCompetent,
                        is_name_address_correct: isNameAddressCorrect,
                        is_ordercopy_attached: isOrdercopyAttached,
                        date_of_order: dateOfOrder,
                        date_of_communication: dateOfCommunication,
                        date_of_application: dateOfApplication,
                        date_on_copy_ready: dateOnCopyReady,
                        date_of_receipt: dateOfReceipt,
                        date_of_filing: dateOfFiling,
                        date_of_submission_hardcopy: dateOfSubmissionHardcopy,
                        is_delay_on_submission: isDelayOnSubmission,
                        amount_of_delay_on_submission:
                            amountOfDelayOnSubmission,
                        is_appeal_filed_within_limitation:
                            isAppealFiledWithinLimitation,
                        is_delay_in_filing: isDelayInFiling,
                        amount_of_delay_in_filing: amountOfDelayInFiling,
                        is_condonation_of_delay_filed:
                            isCondonationOfDelayFiled,
                        objection_for_condonation: objectionForCondonation,
                        is_fees_paid: isFeesPaid,
                        date_of_payment: dateOfPayment,
                        copy_of_receipt: copyOfReceipt,
                        is_pagination_correct: isPaginationCorrect,
                        legible_docs: legibleDocs,
                        is_appeal_memo_annexed: isAppealMemoAnnexed,
                        is_served_by_post: isServedByPost,
                        is_auth_stamped: isAuthStamped,
                        is_email_phone_on_record: isEmailPhoneOnRecord,
                        appealId: appealId,
                    },
                    { where: { appealId: appealId } }
                );

                const updatedChecklist = await Checklist.findOne({
                    where: { appealId: appealId },
                });

                return res.json(updatedChecklist);
            }
            // Create a checklist instance
            const checklist = Checklist.build({
                appeal_num: appealNum,
                complaint_num: complaintNum,
                appellant: appellant,
                respondent: respondent,
                section_num: sectionNum,
                is_appeal_competent: isAppealCompetent,
                is_name_address_correct: isNameAddressCorrect,
                is_ordercopy_attached: isOrdercopyAttached,
                date_of_order: dateOfOrder,
                date_of_communication: dateOfCommunication,
                date_of_application: dateOfApplication,
                date_on_copy_ready: dateOnCopyReady,
                date_of_receipt: dateOfReceipt,
                date_of_filing: dateOfFiling,
                date_of_submission_hardcopy: dateOfSubmissionHardcopy,
                is_delay_on_submission: isDelayOnSubmission,
                amount_of_delay_on_submission: amountOfDelayOnSubmission,
                is_appeal_filed_within_limitation:
                    isAppealFiledWithinLimitation,
                is_delay_in_filing: isDelayInFiling,
                amount_of_delay_in_filing: amountOfDelayInFiling,
                is_condonation_of_delay_filed: isCondonationOfDelayFiled,
                objection_for_condonation: objectionForCondonation,
                is_fees_paid: isFeesPaid,
                date_of_payment: dateOfPayment,
                copy_of_receipt: copyOfReceipt,
                is_pagination_correct: isPaginationCorrect,
                legible_docs: legibleDocs,
                is_appeal_memo_annexed: isAppealMemoAnnexed,
                is_served_by_post: isServedByPost,
                is_auth_stamped: isAuthStamped,
                is_email_phone_on_record: isEmailPhoneOnRecord,
                appealId: appealId,
            });

            await checklist.save();

            res.json(checklist);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route GET api/registrar/appeals/:id/checklist
// @desc  View details of filled Checklist (Form A)
// @access Private

router.get('/appeals/:id/checklist', auth, isRegistrar, async (req, res) => {
    try {
        const checklist = await Checklist.findOne({
            where: {
                appealId: req.params.id,
            },
        });

        res.json(checklist);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route PATCH api/registrar/appeals/:id/revert
// @desc  revert back to receptionist
// @access Private
router.patch('/appeals/:id/revert', auth, isRegistrar, async (req, res) => {
    try {
        const registrar = await AppealState.findOne({
            attributes: ['registrar'],
            where: {
                appealId: req.params.id,
            },
        });

        // check if the appeal is with the registrar
        if (!registrar.get({ plain: true }).registrar) {
            return res.json({ msg: 'appeal is not with the registrar' });
        }

        await AppealState.update(
            {
                appellant: 0,
                receptionist: 1,
                registrar: 0,
                bench: 0,
            },
            {
                where: { appealId: req.params.id },
            }
        );

        const { revertReason } = req.body;

        // see if already reverted once
        const existingAppeal = await RevertedAppeal.findOne({
            where: { appealId: req.params.id },
        });

        if (existingAppeal) {
            const revertedAppeal = await RevertedAppeal.update(
                {
                    reason: revertReason,
                },
                {
                    where: { appealId: req.params.id },
                }
            );

            return res.json({ reason: revertReason });
        }

        const revertedAppeal = RevertedAppeal.build({
            reason: revertReason,
            appealId: req.params.id,
        });

        await revertedAppeal.save();

        res.json(revertedAppeal);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route PUT api/registrar/appeals/:id/forward
// @desc  forward to bench
// @access Private

router.put('/appeals/:id/forward', auth, isRegistrar, async (req, res) => {
    try {
        const registrar = await AppealState.findOne({
            attributes: ['registrar'],
            where: {
                appealId: req.params.id,
            },
        });

        // check if the appeal is with the registrar
        if (!registrar.get({ plain: true }).registrar) {
            return res.json({ msg: 'appeal is not with the registrar' });
        }

        await AppealState.update(
            {
                appellant: 0,
                receptionist: 0,
                registrar: 0,
                bench: 1,
            },
            {
                where: { appealId: req.params.id },
            }
        );

        res.json({ msg: 'table updated' });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route GET api/registrar/bench
// @desc  Fetch appeals on bench
// @access Private

router.get('/bench', auth, isRegistrar, async (req, res) => {
    try {
        // find all appealIds where appealState is bench:1
        const appealIds = await AppealState.findAll({
            attributes: ['appealId'],
            where: {
                bench: 1,
            },
        });

        // return an array of appealIds in the form [{appealId: 3}, {appealId: 4}]
        const appealIdsRaw = appealIds.map((appealId) => {
            return appealId.get({ plain: true });
        });

        // returns an array of appealIds in the form [3,4]
        const appealIdsArray = appealIdsRaw.map((id) => {
            return id.appealId;
        });

        // find the appeals with registrar from appeals table
        const appeals = await Appeal.findAll({
            where: {
                id: appealIdsArray,
            },
        });

        res.json(appeals);
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
