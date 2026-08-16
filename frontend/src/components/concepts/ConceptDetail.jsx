import { Card, CardBody, CardHeader } from '../ui/Card'

const ConceptDetail = ({ concept }) => {
  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl md:text-3xl font-bold">{concept.name}</h1>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* Definition */}
        <div>
          <h2 className="text-lg font-semibold mb-2">📖 Definition</h2>
          <div className="bg-gray-50 p-4 rounded-lg text-gray-700 border border-gray-200">
            {concept.definition}
          </div>
        </div>

        {/* Example */}
        {concept.example && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Example</h2>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700 border border-gray-200 whitespace-pre-wrap">
              {concept.example}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default ConceptDetail