import React from 'react';
import CommunitySheet from '../components/credo/CommunitySheet';
import PartnerProjectsSlider from '../components/credo/PartnerProjectsSlider';

const CredoPage: React.FC = () => {
    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-3xl font-heading font-extrabold tracking-tight text-on-background">PARTNER PROJECTS</h2>
                <p className="text-lg font-subheading text-on-background-variant mb-4">Engage with our partner projects to earn points and achievements.</p>
                <PartnerProjectsSlider />
            </div>
            <div className="max-w-[84rem] mx-auto">
                <h2 className="text-3xl font-heading font-extrabold tracking-tight text-on-background mt-12">COMMUNITY LEDGER</h2>
                <p className="text-lg font-subheading text-on-background-variant mb-4">Recognizing the contributions of our members.</p>
                <CommunitySheet />
            </div>
        </div>
    );
};

export default CredoPage;