'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function VerifyPage() {
  const [productId, setProductId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [result, setResult] = useState<'success' | 'failure' | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!productId || !verificationCode) return;

    setIsVerifying(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock result - verify if code matches product ID pattern
    setResult(verificationCode.length > 3 ? 'success' : 'failure');
    setIsVerifying(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tracking">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Verify Product
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Verify product authenticity and supply chain integrity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Product Verification
            </CardTitle>
            <CardDescription>Enter product details to verify authenticity</CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="form-label">Product ID</label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter product ID"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter verification code from product"
                className="form-input"
              />
            </div>

            <Button
              onClick={handleVerify}
              isLoading={isVerifying}
              disabled={!productId || !verificationCode}
              className="w-full"
            >
              Verify Product
            </Button>

            {result && (
              <div className={`p-4 rounded-lg ${
                result === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-3">
                  {result === 'success' ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">Verification Successful</p>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          This product has been verified as authentic.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800 dark:text-red-200">Verification Failed</p>
                        <p className="text-sm text-red-600 dark:text-red-300">
                          Unable to verify this product. Please check the code and try again.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* QR Scanner Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan QR Code
            </CardTitle>
            <CardDescription>Use your camera to scan the product QR code</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <QrCode className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">QR Scanner</p>
                <p className="text-sm text-slate-400">Camera access required</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" disabled>
              Enable Camera
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Verification Info */}
      <Card>
        <CardHeader>
          <CardTitle>About Verification</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">What is verified?</h4>
              <p className="text-sm text-slate-500">
                Product authenticity, supply chain integrity, and origin verification are all checked
                against our blockchain-backed records.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">How it works</h4>
              <p className="text-sm text-slate-500">
                Each product has a unique verification code that links to its complete supply chain
                history, from producer to your hands.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">Why verify?</h4>
              <p className="text-sm text-slate-500">
                Verification ensures you&apos;re getting authentic products while supporting transparent
                and sustainable supply chains.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
